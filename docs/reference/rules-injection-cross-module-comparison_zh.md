# 规则注入模块：跨模块对比报告

针对在 `/Users/yeongyu/local-workspaces` 目录下维护的三种规则注入实现的对比与移植记录：

- **codex-rules**：Codex 钩子插件（`codex-plugins/plugins/codex-rules`，仓库 `code-yeongyu/codex-rules`，分支 `main`）。
- **pi-rules**：pi-mono 扩展（`pi-extensions/pi-rules`，仓库 `code-yeongyu/pi-rules`，分支 `main`）。
- **omo rules-injector**：opencode 插件路径（`omo/src/hooks/rules-injector`，仓库 `code-yeongyu/oh-my-openagent`，分支 `dev`）。

## 0. 最新推送的提交

| 仓库 | 分支 | HEAD | 备注 |
| --- | --- | --- | --- |
| codex-rules | main | `9f49c68 fix(hooks): keep compacted channels independent` | 本轮未变动 |
| pi-rules | main | `9789f12 perf(rules): skip unchanged dynamic targets via fingerprint` | 新增 |
| omo | dev | `fbe423a2d feat(rules-injector): hydrate dedup cache from session transcript` | 新增 |

移植轮次后的安装状态：

- **omo**：`~/.bun/install/global/node_modules/oh-my-opencode` 是指向本地工作区的符号链接，因此 `bun run build` 会立即发布重新构建的 `dist/`。通过 `grep -c transcriptHydration dist/index.js` 验证结果为 6。
- **codex-rules**：重新运行了 `node scripts/install-local.mjs ...`，刷新了 `~/.codex/plugins/cache/code-yeongyu-codex-plugins/codex-rules/0.1.0` 处的缓存。
- **pi-rules**：pi-mono 直接使用包源码，无需单独的安装步骤。

## 1. 性能基准

唯一拥有自己基准测试工具的仓库是 codex-rules（`scripts/bench-codex-rules.mjs`）。在提交 `9f49c68` 上的最新运行结果（40 次迭代，5 次预热，120 条规则，80 个不同目标，240 个重复目标）：

| 场景 | 中位数 ms | 最小值 | 最大值 | 计数器 |
| --- | --- | --- | --- | --- |
| duplicate-targets | 7.12 | 5.66 | 71.21 | findProjectRoot=40, findCandidates=40, readFile=4800 |
| distinct-targets | 200.29 | 52.09 | 467.90 | findProjectRoot=40, findCandidates=40, readFile=4800 |
| hookFastPath repeat-post-tool-use | 2.57 | 2.08 | 5.14 | 重复输出字节数 = 0（去重生效） |

目前尚不存在统一的跨模块基准测试工具，另外两个模块通过其现有的单元测试和集成测试套件进行了验证（pi-rules 通过了 243 项测试，omo rules-injector 通过了 70 项测试）。

## 2. 功能差异矩阵（移植前）

| 功能 | codex-rules | pi-rules | omo rules-injector |
| --- | --- | --- | --- |
| 压缩前去重 | 持久化 JSON + 会话记录扫描 | 内存 Set/Map | 内存 Map + 持久化 JSON |
| 感知会话记录的去重 | **是** | 否（pi-mono SDK 未暴露 `transcript_path`） | **否**（曾是真实存在的差距） |
| 动态目标指纹识别 | **是** | 否（曾是真实存在的差距） | 否（改为在工具输出时延迟处理） |
| 持久化会话缓存 | 是（单会话 JSON） | 否（进程内状态） | 是（单会话 JSON） |
| 压缩后策略 | 独立的静态/动态挂起通道 | `engine.resetSession(cwd)`（完全重置） | `clearSessionState(sessionID)`（完全重置） |
| 多个注入钩子 | SessionStart, UserPromptSubmit, PostToolUse, PostCompact | session_start, session_compact, before_agent_start, tool_result | 仅限 tool.execute.after |
| 规则发现缓存 | 单次调用发现缓存 + 解析内容缓存 | 单次调用发现缓存 + 解析内容缓存 + 匹配缓存 | 已解析规则 LRU + 匹配决策 LRU + 扫描缓存 |
| 规则源实现 | 自带查找器（匹配 pi-rules 布局） | 自带查找器 | 共享的 `@oh-my-opencode/rules-engine` 工作区包 |

## 3. 性能差异矩阵（移植前）

| 场景 | codex-rules | pi-rules | omo |
| --- | --- | --- | --- |
| 热路径：相同目标重复 | 指纹匹配 → 跳过解析 + 匹配（约 2.5 ms） | 总是重新发现，但匹配缓存吸收了匹配开销 | 已解析规则缓存 + 匹配决策缓存吸收了匹配开销 |
| 带 N 条规则的冷启动 | 在 80 个不同目标上运行 120 条规则约需 200 ms | 相当 | 相当 |
| 首次钩子上的会话记录扫描开销 | 规则体 2KB 前缀 + 路径标记搜索（开销极低） | 不适用，无会话记录暴露 | **此前缺失**，已在本轮中添加 |
| 压缩后的首次钩子 | 仅重新注入挂起的通道 | 完全重置，下一个钩子重新注入所有内容 | 清除缓存，下一个文件工具延迟重新注入所有内容 |

## 4. 移植决策（优中选优，本轮）

| 功能特性 | 应用对象 | 原理 / 结果 |
| --- | --- | --- |
| 动态目标指纹识别 | pi-rules | 当每个候选对象的磁盘指纹未发生变化时，完全跳过发现、解析和匹配。镜像了 codex-rules 的 `fingerprintDynamicTargets` + `dynamicTargetCacheKey` + `fileStatFingerprint`。新增的 `EngineDeps.fileFingerprint?` 注入在测试夹具使用合成路径时保持测试的确定性。 |
| 感知会话记录的去重 | omo rules-injector | 当持久化 JSON 被删除的新进程，或者缓存被 `session.compacted` 清除的会话，仍然可以检测到会话记录中存留的先前 `[Rule: <relativePath>]` 横幅，从而避免输出重复内容。采用延迟加载（每个进程每个会话获取一次），设有限制（扫描 200 条消息 / 1 MB），在传输错误时容错运行，且并发调用共享单个进行中的 Promise。 |
| 感知会话记录的去重 → pi-rules | 未应用 | pi-mono 的 `ToolResultEvent` 不携带 `transcript_path`。移植需要上游 SDK 的改动。由于 pi-rules 是进程内运行，极少遇到 codex-rules / omo 可能碰到的“会话中途缓存消失”情况，因此净损失很小。 |
| 动态目标指纹识别 → omo | 推迟 | omo 已经拥有已解析规则 LRU 和匹配决策 LRU 缓存，吸收了大部分热路径工作。目前添加第三个指纹层投资回报率（ROI）较低。在第 7 节中作为未来工作进行跟踪。 |
| 压缩后通道挂起 → pi-rules / omo | 未应用 | 两者都在进程内顺序运行钩子；codex-rules 的通道挂起状态专门用于解决 Codex 进程外钩子模型的规避方案。完全重置对 pi-rules 和 omo 均能正常工作。 |

## 5. 实现细节

### pi-rules（`9789f12 perf(rules): skip unchanged dynamic targets via fingerprint`）

- 新增 `Engine` 公共方法：`fingerprintDynamicTargets`、`isDynamicTargetFingerprintCurrent`、`commitDynamicTargetFingerprints`。导出了 `DynamicTargetFingerprint` 接口。
- 新增会话字段：`SessionState.dynamicTargetFingerprints: Map<string, string>`。由 `clearSession` 清除，因此 `resetSession` 已涵盖压缩处理。
- 新增可选依赖：`EngineDeps.fileFingerprint?: (filePath: string) => string`。默认值：`statSync(path, { bigint: true })` 的 mtimeNs/ctimeNs/size；可在测试夹具使用合成路径时进行注入。
- `src/index.ts` 的 `tool_result` 处理器现在首先计算指纹，始终调用 `commitDynamicTargetFingerprints`，并在每个目标都处于最新状态时完全绕过 `loadDynamicRules`。
- 测试：243/243 项 vitest 通过，biome 检查无误，tsgo 类型检查无误。在 `test/engine.test.ts` 中新增了测试：
  - 提交后指纹保持“最新”状态
  - 当底层文件指纹更改时，指纹发生翻转
  - `resetSession` 清除 `dynamicTargetFingerprints`

### omo rules-injector（`fbe423a2d feat(rules-injector): hydrate dedup cache from session transcript`）

- 新增文件 `src/hooks/rules-injector/transcript-hydration.ts`（约 140 行代码），暴露了具有三个方法的 `createTranscriptHydrationStore({ client })`：`hydrateSession(sessionID)`、`getHydratedRelativePaths(sessionID)`、`clearSession(sessionID)`。
- 水合（Hydration）扫描每个会话的最后 `200` 条消息以及最多 `1_000_000` 个字符的文本，在每个进程的每个会话中精确匹配一次 `\[Rule: <relativePath>\]\n\[Match: <reason>\]`，并将并发调用合并到单个进行中的 Promise。传输错误时容错运行，因此注入绝不会阻塞。
- 在 `createRuleInjectionProcessor` 上新增可选依赖 `transcriptHydration?: TranscriptHydrationHook`。未传递该依赖的现有测试保持其旧行为，从而使所有 70 项 rules-injector 测试保持通过状态。
- `hook.ts` 将 `createTranscriptHydrationStore({ client: ctx.client })` 接入处理器，并在 `session.deleted` 和 `session.compacted` 事件中调用 `transcriptHydration.clearSession(sessionID)`，以确保压缩后的重新注入仍能正常工作。
- 新增测试：`transcript-hydration.test.ts`（7 个用例：标记扫描、空会话记录、单飞（single-flight）、并发调用、错误回退、clearSession、嵌入式标记）以及 `injector.test.ts` 中的 2 个集成用例（水合路径吸收重复项；无关的水合路径不阻塞合法注入）。bun test 统计结果：rules-injector 70/70 通过，类型检查无误，biome 检查无误。

### codex-rules（本轮无变动）

codex-rules 已经实现了感知会话记录的去重和压缩后通道挂起。在提交 `9f49c68` 上重新运行了基准测试，并刷新了本地安装缓存。

## 6. 验证摘要

| 仓库 | 测试 | 类型检查 | 代码规范 | 构建 | 安装 | 推送 |
| --- | --- | --- | --- | --- | --- | --- |
| codex-rules | 59/59 vitest（先前提交已验证），重新运行基准测试 | tsc 正常 | biome 正常 | tsc -p tsconfig.build.json 正常 | `~/.codex/plugins/cache/...` 已刷新 | 已是最新 |
| pi-rules | 243/243 vitest | tsgo 正常 | biome 正常 | 不适用（源码导入包） | 不适用 | 已推送 `9789f12` |
| omo | rules-injector 70/70 bun test | tsgo 正常（工作区 + 包） | biome 正常 | `bun run build`（dist/index.js 4.53 MB） | 全局符号链接获取到新的构建产物 | 已推送 `fbe423a2d` |

注意：omo 更广泛的钩子测试套件仍会暴露先前存在的测试隔离不稳定性（dev 分支上最近的合并字面命名为 `fix/test-isolation-cross-test-state-leak`）。每个受影响的文件在单独运行时均能通过，这些失败与本轮的更改无关。

## 7. 有意留待后期的后续工作

1. 将动态目标指纹识别移植到 omo 中，以便在目标未发生任何变化时，缓存未命中不会重新遍历 `findRuleFiles`。
2. 编写共享的 `bench-rules-comparison.mjs` 工具，通过相同的规则夹具驱动这三种实现，以便能够定量检测未来的性能退化。
3. 向 pi-mono 提交 PR，在 `ToolResultEvent` 上暴露 `transcript_path`（或等效的会话记录读取器），以便 pi-rules 可以像 codex-rules 和 omo 一样采用感知会话记录的去重。
4. 解决 omo 更广泛的钩子测试中残留的跨套件状态泄漏不稳定性，使完整的 `bun test src/hooks` 运行能够稳定通过。
