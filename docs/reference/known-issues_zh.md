# 已知问题

用于跟踪当前版本中存在但已被有意推迟的缺陷。每个条目都应解释其症状、历史记录、规避方法以及计划的解决方案。

## v4.2.1：Delegate-task 早期失败回退（BLOCKER-4，已解决）

BLOCKER-4 已在 v4.2.1 中解决。被委派的子会话现在会在分发前保留首次 Prompt 负载，并在运行时回退必须重试历史记录为空的子会话时，仅使用一次该引导负载。

## v4.2.0：Delegate-task 早期失败回退（BLOCKER-4，从 PR #3825 推迟）

### 症状

在首次调用 `promptAsync` 时失败的被委派子会话（例如，在持久化任何会话历史记录之前，服务商拒绝了请求）可能无法推进到配置的回退模型。会话会以早期失败结束，而不是使用链中的下一个回退模型进行重试。

这会影响通过 delegate-task 工具（后台或同步）启动的子智能体，此时首次服务商调用立即失败，且 `session.messages` 仍为空。

### 历史记录

PR #3825（`tw-yshuang/fix/delegated-child-session-early-failure-fallback`，于 2026-05-07 合并为 `cd33f3a39`，随后为 `fac90d69f`）引入了共享引导上下文（`src/shared/delegated-child-session-bootstrap.ts`），用于在首次 Prompt 分发前捕获重试负载，以便历史记录为空的失败仍能通过回退链进行重试。

在该合并合入 `dev` 分支后，该 PR 自身的回归测试（`src/hooks/runtime-fallback/index.test.ts` 中的 `delegated child-session empty-history fallback retries with captured bootstrap prompt`）在干净的根目录 `bun test --timeout 30000` 运行中失败（6828 通过 / 1 失败）。PR #4044（`code-yeongyu/revert/3825-delegated-bootstrap`，还原提交为 `3c7d1299a`，合并还原提交为 `e2b8e49e2`，于 2026-05-15 合并）还原了该合并，以保持 `dev` 分支为绿色（在 709 个文件中，6823 通过 / 0 失败 / 6 跳过）。

该 PR 所针对的原始失败模式在 v4.2.0 中仍然存在。

### 规避方法

- 对于被委派的子智能体，优先选择在首次调用时能可靠成功的服务商（在请求时极少因认证或配额错误而失败）。
- 在 `categories[].fallback_models` 中保守地配置回退模型，并接受首次失败可能无法自动重试的情况。
- 一旦子智能体产生任何历史记录，现有的已持久化历史记录运行时回退重试路径仍能正常工作。

### 跟踪

Issue #4059 正在跟踪具有稳定回归测试覆盖的重新合入工作。重新合入已推迟到后续版本，并且应当考虑当前的 Schema 结构变化以及 prompt-async-gate 语义。

## #4225：`.opencode/oh-my-openagent.jsonc` 中的自定义 LSP 配置被静默忽略

- **影响版本**：v4.2.3+（在 LSP 到 MCP 迁移之后）。
- **症状**：项目 `oh-my-openagent.jsonc` 中的自定义 LSP 服务器配置在运行时未被应用。
- **规避方法**：改为通过 OpenCode 的原生 `lsp` 配置来配置您的 LSP 服务器。
- **状态**：未解决。跟踪于 https://github.com/code-yeongyu/oh-my-openagent/issues/4225。
