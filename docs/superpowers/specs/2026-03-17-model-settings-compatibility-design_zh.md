# 模型设置兼容性解析器设计

## 目标

引入一个中央解析器。该解析器接收已选定的模型和一组期望的模型设置，然后返回该特定模型最佳的兼容配置。

这与模型回退机制明确区分开来。

## 问题

目前，`variant` 和 `reasoningEffort` 的兼容性逻辑分散在多个地方：
- `hooks/anthropic-effort`
- `plugin/chat-params`
- 代理/类别/回退配置层
- 委托/后台提示词管道

这导致了不一致的行为：
- 某些路径会限制不支持的级别
- 某些路径会原样传递它们
- 某些路径会静默丢弃它们
- 某些路径使用特定模型系列的假设，这些假设无法推广

其结果是，即使所选模型本身有效，请求行为也十分脆弱。

## 范围

第一阶段仅涵盖：
- `variant`
- `reasoningEffort`

第一阶段范围之外：
- 模型回退本身
- `thinking`
- `maxTokens`
- `temperature`
- `top_p`
- 设置的自动向上重映射

## 期望行为

在给定固定模型和期望设置的情况下：
1. 如果支持期望的值，则保留它。
2. 如果不支持，则降级到最接近的较低兼容值。
3. 如果不存在兼容的值，则丢弃该字段。
4. 不要切换模型。
5. 在第一阶段不要自动升级设置。

## 架构

添加一个中央模块：
- `src/shared/model-settings-compatibility.ts`

核心 API：

```ts
type DesiredModelSettings = {
  variant?: string
  reasoningEffort?: string
}

type ModelSettingsCompatibilityInput = {
  providerID: string
  modelID: string
  desired: DesiredModelSettings
}

type ModelSettingsCompatibilityChange = {
  field: "variant" | "reasoningEffort"
  from: string
  to?: string
  reason: string
}

type ModelSettingsCompatibilityResult = {
  variant?: string
  reasoningEffort?: string
  changes: ModelSettingsCompatibilityChange[]
}
```

## 兼容性模型

第一阶段应当是**元数据优先，即在平台公开可靠能力数据的地方优先使用元数据**，只有在元数据缺失时才回退到基于系列的规则。

### 变体兼容性

首选的可信数据源：
- OpenCode/提供商模型元数据（`variants`）

元数据不可用时的回退方案：
- 基于系列的阶梯

回退阶梯示例：
- Claude Opus 系列：`low`、`medium`、`high`、`max`
- Claude Sonnet/Haiku 系列：`low`、`medium`、`high`
- OpenAI GPT 系列：仅在元数据缺失时进行保守的系列回退
- 未知系列：保守地丢弃不支持的值

### 推理力度兼容性

当前第一阶段的可信数据源：
- 保守的模型/提供商系列启发式规则

原因：
- 当前可用的 OpenCode SDK/提供商元数据公开了模型 `variants`，但没有为 `reasoningEffort` 级别公开等效的单模型能力列表

示例：
- GPT/OpenAI 风格模型：在系列启发式规则支持的情况下，使用 `low`、`medium`、`high`、`xhigh`
- 通过当前 OpenCode 路径的 Claude 系列：在第一阶段将 `reasoningEffort` 视为不支持并将其移除

解析器应当仅保持纯粹的模型/设置逻辑。传输限制仍由请求构建路径负责。

## 关注点分离

此设计有意分离了以下内容：
- 模型选择（`resolveModel...`、回退链）
- 设置兼容性（本解析器）
- 请求传输兼容性（`chat.params`、提示词主体约束）

这保持了职责清晰：
- 首先选择模型
- 其次规范化设置
- 最后构建请求

## 首个集成点

第一阶段应当首先集成到 `chat.params` 中。

原因：
- 该路径已经是请求时调整的集中路径。
- 它能影响面向提供商的选项，而不会将不支持的字段泄漏到提示词有效负载主体中。
- 这样可以避免尝试同时修补每个提示词构造函数。

## 推广计划

### 第一阶段
- 添加解析器模块和测试
- 集成到 `chat.params`
- 迁移 `anthropic-effort`，使其使用解析器，或者成为围绕解析器的薄 Claude 专用补充

### 第二阶段
- 扩展到 `thinking`、`maxTokens`、`temperature`、`top_p`
- 如果需要，使请求路径能力表正式化

### 第三阶段
- 将所有变体/推理规范化集中起来，远离分散的钩子和临时调用者

## 风险

- 将系列规则过度拟合到当前的模型命名约定
- 意外更改目前依赖隐式行为的路径上的请求语义
- 将提供商传输限制与模型能力逻辑混淆

## 缓解措施

- 在第一阶段保持解析器纯粹且范围狭窄
- 为保留/降级/丢弃决策添加显式回归测试
- 首先在一个中心点（`chat.params`）进行集成
- 在期望值已经有效的情况下保留现有行为

## 建议

在专用分支/工作区中，将中央解析器作为新的隔离实现继续推进。
这是干净的长期路径，比继续在钩子中添加特殊情况限制更具可评审性。
