# ADR: prompt-async-gate：基于预留的重复注入防护机制

## 状态

已接受 (于 v4.2.0 引入)

## 上下文

Issue #4012 报告了在 OMO 向活跃的 OpenCode 会话注入内部消息后，出现重复流式输出的问题。

用户可见的故障表现为两个助手气泡流式传输相同的后续内容。

根本的竞态条件并非单个钩子做出了错误决策。多个内部路由可能会观察到相同的空闲、完成或错误边缘，并各自判定父会话需要唤醒或恢复提示词。

最主要的竞态窗口如下：

1. OpenCode 触发了 `session.idle` 事件。
2. OMO 启动了 `isSessionActive` HTTP 轮询。
3. OpenCode 仍在控制上一个回答的流式动画节奏。
4. 轮询观察到一个处于非活跃或看似空闲的会话。
5. OMO 注入了后续提示词。
6. 第二个钩子观察到相同的边缘并再次注入。
7. 用户看到了两个助手气泡。

历史竞态发生点在构建后的包中可见，位于 `dist/index.js:69665-69680`。该代码在发送内部提示词之前检查了会话活跃度，但该检查和提示词发送并未受到共享预留机制的保护。

OpenCode 的 `prompt_async` 路由加剧了这一故障模式，因为它具有“发射后不管”的语义。`session.promptAsync` 可能会在提示词被目标会话持久接受之前就完成 resolve。针对同一次尝试，后续仍可能到达 `session.error` 事件，导致调用方认为分发已完成，而恢复钩子却仍将会话视为符合重试条件。

OMO 拥有 13 个以上可以注入提示词的内部钩子调用方，包括：

- 后台任务父级唤醒
- 运行时回退重试
- 模型建议重试
- 团队邮箱实时投递
- 会话恢复后续
- 待办事项后续恢复
- CLI 运行恢复
- Claude Code 钩子注入
- 同步子智能体提示词
- 后台子智能体提示词

仅靠路由本地的防护无法消除这种竞态。每个路由在孤立状态下可能都是正确的，但仍会在同一个进程中与另一个路由发生冲突。

根目录下的 `AGENTS.md` 现在在“内部消息注入是危险的”章节中记录了主导不变式：生产代码只能在 `src/shared/prompt-async-gate.ts` 内部调用 `session.prompt` 或 `session.promptAsync`。所有其他路由必须使用该共享网关。

## 决策

创建 `src/shared/prompt-async-gate.ts`，作为原始 OpenCode 提示词分发的唯一生产环境所有者。

该网关暴露了一个生产环境调用方必须使用的公共分发器：

```ts
export function dispatchInternalPrompt(
  options: InternalPromptDispatchArgs,
): Promise<InternalPromptDispatchResult>
```

该网关通过一个模块全局的预留映射表来协调调用方：

```ts
const reservations = new Map<string, Reservation>()
```

该映射表以 `sessionID` 为键。预留记录了声明会话的源、过期时间以及一个 `Symbol(source)` 令牌。该令牌赋予了每个预留超越其文本源的唯一身份标识。

每个调用方都提供一个稳定的 `source` 字符串，例如：

```ts
const source = `background-agent:${taskID}`
```

共享流程如下：

1. 清理已过期的预留。
2. 在等待或分发之前预留会话。
3. 等待空闲稳定期。
4. 轮询会话活跃度，除非该路由有经过验证的免除机制。
5. 通过选定的 OpenCode 提示词 API 进行分发。
6. 在分发后的保持期内维持预留。
7. 在保持期结束后或通过显式恢复路径释放预留。

预留是在活跃度轮询之前获取的，这样可以防止两个钩子同时进入“轮询与分发”窗口。

默认的分发后保持时间导出为：

```ts
export const DEFAULT_PROMPT_ASYNC_POST_DISPATCH_HOLD_MS = 2_000
```

`postDispatchHoldMs` 自 v4.2.3 起默认值为 2_000 毫秒（2 秒，此前为 250 毫秒）。即使分发同步抛出异常或返回失败结果，网关也会在分发尝试后短暂持有预留。这消除了 `AGENTS.md` 中提到的风险，即 `promptAsync` 在持久接受之前就返回，且迟到的 OpenCode 错误与重试逻辑发生竞态。这一 8 倍的提升减少了在较慢的服务商上与到达的 `session.error` 之间的分发冲突。

默认的分发超时时间为 30 秒：

```ts
export const DEFAULT_PROMPT_DISPATCH_TIMEOUT_MS = 30_000
```

`dispatchTimeoutMs` 使用 `Promise.race` 包装了底层的 `session.promptAsync` 或 `session.prompt` 调用。挂起的 OpenCode API 调用必须以失败关闭，而不是永远持有预留。

公共分发器委托给一个内部运行器：

```ts
dispatchAfterSessionIdle<TInput>(args)
```

`dispatchInternalPrompt({ mode: "async", ... })` 绑定了 `session.promptAsync`。
`dispatchInternalPrompt({ mode: "sync", ... })` 绑定了 `session.prompt`。
共享运行器使得异步和同步提示词路由的预留、保持、超时、日志记录以及活跃会话行为保持完全一致。

公共网关返回的结果是一个可辨识联合。调用方必须将 `active` 和 `reserved` 视为成功的抑制，而不是自动重试信号。在分发前更改了乐观任务或循环状态的路由，在网关返回 `failed`、`unavailable` 或需要回滚的跳过状态时，负责恢复该状态。

网关暴露了 `releasePromptAsyncReservation` 以用于有意的恢复路径。前缀释放被刻意限制得很严格：

```ts
export function releasePromptAsyncReservation(
  sessionID: string,
  options?: {
    reservedBy?: string
    reservedByPrefix?: string
  },
): boolean

releasePromptAsyncReservation(sessionID, {
  reservedByPrefix: "runtime-fallback:",
})
```

`reservedByPrefix` 必须以 `:` 结尾。这可以防止诸如 `runtime` 之类的宽泛释放匹配到无关的源。对于知道完整预留源的调用方，精确源释放仍然可用。

网关之外的原始提示词调用会被 `src/shared/prompt-async-route-audit.test.ts` 拦截。该审计使用 TypeScript 编译器 API 而非正则表达式，因此它可以捕获解构、方括号访问、可选链以及别名或类型转换访问模式。

## 后果

### 积极影响

- 针对重复的内部提示词注入，现在每个会话只有一个预留胜出者。
- 分发后的保持期消除了 `AGENTS.md` 中“在持久接受之前返回”的风险，即使分发同步报错也是如此。
- 分发超时防止了挂起的 OpenCode 调用永久占用网关。
- 13 个以上的内部钩子调用方共享同一个结果模型和同一个安全原语。
- 来自 HIGH-5 的基于 AST 的审计比先前的正则表达式审计能捕获更多的绕过形式。
- 特定路由的测试可以专注于路由行为，而共享网关测试则专注于预留语义。

### 消极影响

- 当原始提示词未能持久到达服务器时，执行释放并重试的调用方侧重试逻辑必须显式调用 `releasePromptAsyncReservation`。`src/shared/model-suggestion-retry.ts` 是参考案例。
- 13 个以上的接入点都需要感知网关结果。将 `reserved` 视为失败可能会导致嘈杂的重试。
- 有效的重试可能会被默认的 2_000 毫秒分发后保持期延迟（在 v4.2.3 中从 250 毫秒提高）。
- 预留映射表是进程本地的。它保护当前插件进程中的 OMO 钩子，而不是所有可能的 OpenCode 进程。

### 迁移

现有的 `session.prompt` 和 `session.promptAsync` 调用方必须通过具有匹配分发模式的 `dispatchInternalPrompt` 进行路由。

现有的生产环境调用方已通过引入 PR #4034 完成接入。

如果在没有白名单条目的情况下添加了原始提示词调用，基于 AST 的审计将导致 CI 失败。任何白名单条目都必须解释为什么原始访问不是分发路由，或者为什么它仍然是通过网关路由的。

新的内部消息路由必须为其触发器包含重复注入回归测试。仅靠静态策略是不够的。

### 未来工作

- 用完整的基于 Symbol 令牌的释放所有权取代前缀收紧的释放。这是 HIGH-7 延迟的工作。
- 定义同源并发调用方处理。某些路由可能需要按源而不是仅按会话进行折叠语义处理。
- 添加用于可观测性的分发指标，包括预留胜出、预留跳过、活跃跳过、超时和失败分发计数。
- 如果 OpenCode 暴露了持久会话锁或幂等键，考虑跨进程协调。

## 参考资料

- Issue #4012：重复流式输出和两个助手气泡。
- PR #4034：引入 `prompt-async-gate`。
- Commit `b333a5280`：`fix(prompt-async-gate): add dispatch timeout, shared runner, harden prefix release`。
- Commit `8c4cc09de`：`test(prompt-async-route-audit): migrate to TypeScript AST walker`。
- Commit `ff1b15d53`：`fix(model-suggestion-retry): release reservation before retry attempt`。
- Commit `f93d7297c`：`test(prompt-async-gate): cover dispatch timeout and post-dispatch error hold`。
- PR #3866 至 PR #4053：用于压缩后恢复的模式兼容合成工具结果，与安全恢复分发相关。
- 根目录 `AGENTS.md`：“内部消息注入是危险的”章节。
- `.omo/rules/test-discipline.md`：禁止在测试中使用 `setTimeout(resolve, N)` 和 `await sleep(N)`，除非时间本身就是被测系统。
- 实现：`src/shared/prompt-async-gate.ts`。
- 审计：`src/shared/prompt-async-route-audit.test.ts`。
