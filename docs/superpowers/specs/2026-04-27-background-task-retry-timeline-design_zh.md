# 后台任务重试时间线设计

日期：2026-04-27
状态：草案已批准用于规范评审

## 目标

让用户能够从父会话界面直观理解后台任务的重试过程。

目前，重试尝试会创建独立的子会话，但用户主要只能看到第一个失败的子会话，并且必须自行推断是否发生了重试。本设计的目标是在保留独立重试子会话的同时，在父会话中展示一个尝试时间线。

## 用户效果

对于跨模型重试的后台任务，父会话应当显示一个紧凑的尝试时间线，例如：

- 尝试 1，失败，`openai/gpt-5.4-mini`，会话 `ses_aaa`
- 尝试 2，失败，`anthropic/claude-haiku-4.5`，会话 `ses_bbb`
- 尝试 3，已完成，`google/gemini-2.5-flash-lite`，会话 `ses_ccc`

重试子会话仍然是真实、独立的子智能体会话。父会话则成为权威的摘要展示界面。

## 范围

### 范围内

- 在 `BackgroundTask` 中添加结构化的重试尝试历史
- 更新后台重试生命周期，为每个子会话记录一次尝试
- 在父会话通知中呈现尝试时间线
- 为每次尝试包含会话 ID 和模型 ID

### 范围外

- 重新设计完整的会话列表界面
- 在第一版迭代中将时间线构建到 `background_output` 中
- 迁移在此功能创建之前生成的历史任务
- 将重试子会话合并为一个虚拟会话

## 设计摘要

### 1. 后台任务状态模型

使用 `attempts` 数组扩展 `BackgroundTask`。

同时添加：

- `currentAttemptID?: string`

每次尝试必须拥有自己不可变的标识，这样来自被取代子会话的异步事件就不会误修改错误的尝试。

每次尝试应当追踪：

- `attemptID: string`
- `attemptNumber: number`
- `sessionID?: string`
- `providerID?: string`
- `modelID?: string`
- `variant?: string`
- `status: "pending" | "running" | "completed" | "error" | "cancelled" | "interrupt"`
- `error?: string`
- `startedAt?: Date`
- `completedAt?: Date`

### 任务级不变式

为了保持兼容性，`BackgroundTask` 保留了现有的顶层字段（`status`、`sessionID`、`model`、`startedAt`、`completedAt`、`error`），但必须将它们视为**当前或最新尝试的投影**。

规则：

- `currentAttemptID` 指向唯一允许接收活动生命周期更新的尝试
- 任务级的 `sessionID`、`model`、`status`、`startedAt`、`completedAt` 和 `error` 必须镜像当前或最新尝试的状态
- 历史尝试一旦进入终态即变为只读

这避免了两个相互竞争的真理来源。

这把重试历史转变为结构化的任务状态，而不是一系列推断出来的通知。

### 2. 尝试生命周期

#### 初始启动

当后台任务首次启动时：

- 创建处于 `pending` 状态的尝试 1
- 从初始任务模型中填充模型信息
- 一旦 `startTask()` 创建了第一个子会话，就填入 `sessionID`、`startedAt` 并标记为 `running`
- 将 `currentAttemptID` 设置为尝试 1

#### 已调度重试

当选择回退重试时：

- 使用最新的错误和完成时间，将当前尝试定稿为失败
- 创建下一个处于 `pending` 状态的尝试
- 在排队前填充其下一个回退模型的元数据
- 将 `currentAttemptID` 更新为新的尝试

调度器必须将新的 `attemptID` 传递给后续的会话创建步骤。绑定绝不能通过推断指向“最新的挂起尝试”。

此时，之前处于活动状态的尝试将变得不可变。

#### 重试会话就绪

当 `startTask()` 创建重试子会话时：

- 将创建的子会话绑定到精确调度的 `attemptID`
- 分配新的 `sessionID`
- 设置 `startedAt`
- 将尝试标记为 `running`

绑定规则：

- 会话创建必须调用类似于 `bindAttemptSession(attemptID, sessionID, ...)` 的方法
- 仅当该精确尝试仍是活动的挂起或运行中尝试时，绑定才会成功
- 如果该尝试已被取代或已终止，则新会话将被中止或忽略，而不是重新绑定到另一个尝试

#### 最终完成或失败

当任务结束时：

- 将当前尝试标记为 `completed`、`error`、`cancelled` 或 `interrupt`
- 记录 `completedAt`

### 挂起子状态

在内部，处于 `pending` 状态的尝试可以代表不同的运行状况：

1. 因并发限制而在队列中等待
2. 已选择重试，但尚未创建新的子会话
3. 在子会话存在之前，会话创建已失败

第一版迭代可能仍会将这三种情况在父会话时间线中渲染为 `pending`，但实现上应当在状态转换和通知文本中对它们进行区分，以便保持调试过程的清晰。

## 父会话呈现

### 平衡的默认展示

默认情况下，父会话应当显示一个信息平衡的时间线：

- 每次尝试占用一行
- 模型 ID
- 结果
- 会话 ID

示例：

```text
Background task attempts:
- Attempt 1 — ERROR — openai/gpt-5.4-mini — ses_aaa
  Error: Forbidden: Selected provider is forbidden
- Attempt 2 — ERROR — anthropic/claude-haiku-4.5 — ses_bbb
  Error: Too Many Requests
- Attempt 3 — COMPLETED — google/gemini-2.5-flash-lite — ses_ccc
```

### 父级通知规则

父级应当接收到三种与重试相关的更新：

1. **已调度重试**
   - 失败的会话 ID
   - 失败的模型
   - 失败的错误信息
   - 下一个模型

2. **重试会话就绪**
   - 重试会话 ID
   - 尝试序号
   - 模型

3. **最终摘要**
   - 包含所有尝试的紧凑尝试时间线

对于任何终态的任务结果，都应当发出最终摘要：

- 已完成 (completed)
- 错误 (error)
- 已取消 (cancelled)
- 中断 (interrupt)

最终摘要是面向用户的权威信息来源。

## 数据所有权

`BackgroundTask` 是此状态的合适所有者，因为：

- 重试会修改并重新排队相同的后台任务 ID
- 子会话是该任务生命周期的实现细节
- 父级通知已经源自后台任务状态

这避免了从会话日志或提醒文本中重新构建尝试历史。

## 修改契约

所有尝试的写入都应当通过由后台任务生命周期拥有的一组小型辅助函数来进行。

建议的辅助函数：

- `startAttempt(...)`
- `bindAttemptSession(...)`
- `scheduleRetry(...)`
- `finalizeAttempt(...)`

同时，为与任务生命周期关联的活动和历史子会话维护一个轻量级的 `sessionID -> attemptID` 映射表。

规则：

- 只有被 `currentAttemptID` 引用的尝试才能接收活动更新
- 一旦尝试定稿，来自其子会话的后续事件将被忽略
- 重试调度必须在创建下一个尝试之前将旧尝试定稿
- 在修改尝试或任务级状态之前，每个生命周期处理器必须首先解析出一个不可变的尝试标识，可以直接通过 `attemptID`，也可以通过 `sessionID -> attemptID`

这是异步后台重试的关键竞态安全机制。

## 关键集成点

### 后台重试路径

- `src/features/background-agent/fallback-retry-handler.ts`
  - 在选择重试时创建下一个尝试条目
  - 在排队前将失败的尝试定稿
  - 记录重试调度元数据，且后续不修改历史尝试

### 会话创建路径

- `src/features/background-agent/manager.ts`
  - 在 `startTask()` 中，将创建的子会话 ID 附加到精确调度的 `attemptID` 上
  - 从尝试状态中发出“重试会话就绪”提醒

### 完成与失败路径

- `src/features/background-agent/manager.ts`
  - 当任务完成或出错时，更新活动尝试的状态
  - 从 `attempts[]` 生成最终的父级摘要
  - 忽略针对较旧尝试会话 ID 的过期事件
  - 在应用更新之前，通过 `sessionID -> attemptID` 解析每个会话生命周期事件

### 后台输出

第一版迭代的范围之外，但相同的 `attempts[]` 状态应当能让后续的扩展变得简单直接。

## 错误处理

### 缺失尝试会话 ID

如果在重试会话存在之前会话创建失败：

- 保持该尝试为 `pending` 状态，直到其终止
- 如果任务永久失败，将该尝试标记为 `error` 且不带 `sessionID`

### 来自被取代会话的迟到事件

如果旧的子会话在已经调度重试后发出了 `session.error`、`message.updated`、`interrupt` 或其他生命周期事件：

- 这些事件绝不能修改新激活的尝试
- 它们可以被记录用于调试
- 除非它们解析为当前活动的 `attemptID`，否则在任务状态层面必须忽略它们

这意味着事件处理不能仅依赖于任务级的 `sessionID`。它必须首先将传入的 `sessionID` 映射到源 `attemptID`，如果该尝试不再是当前尝试，则拒绝该修改。

### 尚无可见子会话的重试

这在以下阶段之间是符合预期的：

- 旧的失败子会话中止
- 新的子会话创建

“已调度重试”通知应当说明下一个尝试已排队。“重试会话就绪”通知则填补了这一可观测性空白。

## 测试策略

### 单元测试

- 首次启动时创建尝试
- 在调度重试时将尝试定稿
- 重试尝试接收新创建的子会话 `sessionID`
- 最终摘要按顺序渲染所有尝试
- 最终摘要为失败和成功的尝试保留各自独立的状态

### 回归测试

- 初始服务商被禁用后成功回退应当产生两次尝试
- 多次失败的重试后成功应当显示完整的尝试链
- 无可用回退的后台任务失败应当仍产生一次终态尝试

## 风险

### 风险：任务与尝试之间的状态漂移

缓解措施：

- 将尝试更新集中在辅助函数中
- 避免散落在重试和完成代码中的手动逐字段写入
- 保持任务级字段作为投影，而不是独立的状态机

### 风险：重复创建重试尝试

缓解措施：

- 仅在重试调度路径中创建尝试条目
- 一次仅使用一个活动的挂起或运行中尝试

### 风险：过期的子会话事件损坏最新的尝试

缓解措施：

- 要求使用 `attemptID` 或 `currentAttemptID`
- 对所有子会话生命周期事件要求进行 `sessionID -> attemptID` 查找
- 以不可变方式定稿尝试
- 忽略来自被取代会话 ID 的迟到事件

### 风险：父会话信息嘈杂

缓解措施：

- 保持最终时间线紧凑
- 仅在重试边界和最终完成时使用提醒

## 建议

首先将尝试时间线实现为结构化的 `BackgroundTask` 状态，并由此派生出父会话摘要。这在保留独立重试子会话的同时提供了最整洁的用户体验，并且在不依赖脆弱的文本解析的情况下，为未来的界面改进奠定了基础。
