# 智能体与模型匹配指南

> **面向智能体与用户**：为什么每个智能体都需要特定的模型，以及如何在不破坏系统的情况下进行自定义。

## 核心洞察：模型即开发人员

将 AI 模型想象成团队中的开发人员。每个人都有不同的脑力、不同的个性和不同的优势。**模型不仅仅是“更聪明”或“更笨”。它们的思考方式不同。** 将相同的指令给到 Claude 和 GPT，它们会以截然不同的方式进行解读。

这不是一个 Bug。这是整个系统的基石。

Oh My OpenAgent 为每个智能体分配一个与其 *工作风格* 相匹配的模型，这就像组建一个团队，让每个人都处于适合其个性的角色中。

### Sisyphus：擅长社交的负责人

Sisyphus 是那种认识每个人、无处不在，并通过沟通和协调来完成工作的开发人员。他与其他智能体交谈，理解整个代码库的上下文，智能地委派工作，并且代码也写得很好。但是深度的、纯技术性的问题？他可能会有些吃力。

**这就是为什么 Sisyphus 使用 Claude / Kimi / GLM。** 这些模型擅长于：

- 遵循复杂的、多步骤的指令（Sisyphus 的提示词约为 1,100 行）
- 在许多工具调用中保持对话流的连贯性
- 理解细微的委派和编排模式
- 输出结构良好、便于沟通的内容

在旧的 GPT 模型上使用 Sisyphus，就像把你最好的项目经理（协调所有人、主持每日站会并保持整个团队步调一致的那个人）单独关在一个房间里去调试竞态条件。这是错误的选择。GPT-5.4 和 GPT-5.5 现在拥有专用的 Sisyphus 提示词路径，但 GPT 仍然不是该编排器的默认推荐模型。

### Hephaestus：深度专家

Hephaestus 是那种整天待在房间里写代码的开发人员。话不多。可能看起来不擅长社交。但给他一个棘手的技术问题，他会在三小时后带着一个别人都找不到的解决方案出来。

**这就是为什么 Hephaestus 使用 GPT-5.5。** GPT-5.5 正是为此而生：

- 无需手把手指导的深度自主探索
- 跨复杂代码库的多文件推理
- 原则驱动的执行（给出目标，而不是具体步骤）
- 长时间独立工作

在 GLM 或 Kimi 上使用 Hephaestus，就像让你最善于沟通、最擅长社交的开发人员独自坐着，除了深度的技术工作外什么都不做。他们最终也能完成任务，但他们不会发光发热，因为你正在浪费恰恰使他们具有价值的技能。

### 核心要点

每个智能体的提示词都经过调整以匹配其模型的个性。**当你改变模型时，你就改变了大脑，相同的指令会被完全不同地理解。** 模型匹配不是关于“更好”或“更坏”。而是关于合适。

---

## Claude 和 GPT 的思考方式有何不同

这对于理解为什么某些智能体同时支持这两个模型家族，而其他智能体不支持至关重要。

**Claude** 响应**机制驱动**的提示词：详细的清单、模板、逐步的过程。规则越多 = 依从性越高。你可以编写一个包含嵌套工作流的 1,100 行提示词，Claude 会遵循每一个步骤。

**GPT**（特别是 5.2+）响应**原则驱动**的提示词：简洁的原则、XML 结构、明确的决策标准。规则越多 = 矛盾面越多 = 越容易偏离。当你陈述目标并让 GPT 自己找出机制时，它的效果最好。

真实示例：Prometheus 的 Claude 提示词在 7 个文件中约为 1,100 行。而 GPT 提示词通过约 121 行中的 3 个原则实现了相同的行为。相同的结果，完全不同的方法。

支持这两个家族的智能体（Prometheus、Atlas）会在运行时自动检测你的模型，并通过 `isGptModel()` 切换提示词。你不需要考虑这个问题。

---

## 步骤 1：检查实际可用的模型

在配置任何内容之前，先看看你当前的系统可以运行什么。

### 列出所有可用模型

```bash
opencode models
```

这将打印出你现在可以寻址的每个 `provider/model` 组合。服务商（Providers）是根据你连接的身份验证以及 `models.dev` 目录派生出来的。

Opencode 会对输出进行排序，以便 `opencode*` 服务商首先出现，这是有意为之的，而不是为了美观。

### 列出已连接的服务商

```bash
opencode auth list
```

显示你已经登录了哪些服务商。

### 如果你想要的模型没有列出

你需要登录该服务商：

```bash
opencode auth login
```

交互式选择器按以下顺序优先考虑服务商：

| 优先级 | 服务商 | Opencode 自身的提示 |
|---|---|---|
| 0 | `opencode` | **（推荐）** |
| 1 | `opencode-go` | 适合所有人的低成本订阅 |
| 2 | `openai` | ChatGPT Plus/Pro 或 API 密钥 |
| 3 | `github-copilot` | - |
| 4 | `anthropic` | API 密钥 |
| 5 | `google` | - |

你也可以跳过选择器：`opencode auth login --provider opencode-go`。

### 验证 oh-my-openagent 实际将使用的模型

```bash
bunx oh-my-opencode doctor
```

这将根据你当前的身份验证状态，显示每个智能体和类别的**有效模型解析**。如果某个智能体显示的是 "system-default"（系统默认）而不是真正的备用模型，这表明你的链中缺少该服务商。

---

## 步骤 2：推荐的技术栈

你不需要每个服务商。你只需要合适的两个。

### 最佳组合：OpenCode Go + OpenAI Plus/Pro

**总计约 30 美元/月。** 在成本和覆盖范围上都优于直接订阅 Anthropic + OpenAI + Google（每月约 60 美元以上）。

| 订阅 | 成本 | 你将获得什么 | 覆盖范围 |
|---|---|---|---|
| **OpenCode Go** | $10/月 | `kimi-k2.5`, `kimi-k2.6`, `glm-5`, `glm-5.1`, `minimax-m2.5`, `minimax-m2.7`, `mimo-v2-pro`, `qwen3.5-plus`, `qwen3.6-plus` | Claude 家族替代方案（Kimi、GLM），Gemini 家族替代方案（Qwen），实用工具/检索（MiniMax） |
| **OpenAI Plus/Pro** | $20+/月 | `gpt-5.4`, `gpt-5.4-pro`, `gpt-5.5`, `gpt-5.3-codex` | GPT 原生智能体（Hephaestus、Oracle、Momus），双提示词智能体的 GPT 路径 |

### 为什么选择这个特定组合

1. **Hephaestus 需要 GPT-5.5。** 它没有 Claude 家族的备用方案。ChatGPT Plus/Pro 或 OpenAI API 访问是成本最低的实际途径。
2. **OpenCode Go 覆盖了编排和创意层面。** Kimi K2.5/2.6 在 Sisyphus/Atlas 中的表现非常像 Claude。GLM-5 填补了长尾需求。当 Gemini 不可用时，Qwen 可以处理视觉任务。
3. **没有单一的服务商可以覆盖所有内容。** 仅限 Anthropic 的配置会破坏 Hephaestus。仅限 OpenAI 的配置会降低 Sisyphus 的表现。你至少需要每个家族中的一个。

### 如果你已经订阅了 Claude 怎么办？

在安装时添加 `--claude=max20`（或 `yes`）。Claude Opus 4.7 将成为 Sisyphus/Prometheus/Atlas 的默认模型，并且你仍然可以免费获得 OpenCode Go 备用模型。同类最佳的编排以及预算安全网。

### 如果你没有任何订阅怎么办？

仅靠 OpenCode Go 就可以让 Sisyphus/Atlas/Oracle/Librarian/Explore 正常工作。Hephaestus 在没有 GPT 访问权限的情况下无法激活，因此你将失去自主深度工作的能力。请考虑尽快添加 ChatGPT Plus。

---

## 步骤 3：模型家族替代方案（优先级顺序）

当“原生”模型不可用时，oh-my-openagent 会遍历每个智能体的备用链，直到连接成功。这些链硬编码在 [`src/shared/model-requirements.ts`](../../src/shared/model-requirements.ts) 中。没有单一的全局优先级列表。每个智能体和类别都有自己的链。

有两个独立的系统：

- **model-fallback**：在 `chat.params` 中使用硬编码的 `AGENT_MODEL_REQUIREMENTS` 和 `CATEGORY_MODEL_REQUIREMENTS` 进行主动解析
- **runtime-fallback**：从 `session.error` 中进行反应式恢复，可在运行时备用钩子中按类别/智能体进行配置

### Claude 家族（善于沟通、遵循指令）

使用者：Sisyphus, Atlas, Sisyphus-Junior, Metis (Claude 路径), Prometheus (Claude 路径), `unspecified-low`, `unspecified-high`。

| 优先级 | 模型 | 服务商 | 为什么 |
|---|---|---|---|
| 1 | `claude-opus-4-7` (max) | `anthropic`, `github-copilot`, `opencode`, `vercel` | 对约 1,100 行 Sisyphus 提示词的整体依从性最好。 |
| 2 | `claude-sonnet-4-6` | 同上 | 更快、更便宜，依然是 Claude。 |
| 3 | **`kimi-k2.5` 或 `kimi-k2.6`（推荐替代方案）** | `opencode-go`, `kimi-for-coding`, `moonshotai`, `opencode`, `vercel` | 指令遵循非常接近 Claude。未连接 Anthropic 时的默认编排器。 |
| 4 | **`glm-5` 或 `glm-5.1`（可接受的替代方案）** | `opencode-go`, `zai-coding-plan`, `opencode`, `vercel` | 类似 Claude，在长嵌套工作流上稍微宽松一些。可靠的备用方案。 |
| 5 | `big-pickle` (GLM 4.6) | `opencode` | 免费层安全网。 |

> **Kimi ≻ GLM。** 在 Sisyphus 的嵌套待办事项+委派提示词下，Kimi K2.5/2.6 的表现比 GLM 更好。只要两者都可用，请优先使用 Kimi。

### GPT 家族（原则驱动、自主）

使用者：Hephaestus, Oracle, Momus, `deep`, `ultrabrain`, `quick`, Prometheus (GPT 路径), Atlas (GPT 路径)。

| 优先级 | 模型 | 服务商 | 为什么 |
|---|---|---|---|
| 1 | `gpt-5.5` / `gpt-5.4` (pro / xhigh / high / medium) | `openai`, `github-copilot`, `opencode`, `vercel` | 原生 OpenAI 是原则驱动提示词的金标准。Hephaestus 需要这个家族。 |
| 2 | `gpt-5.3-codex` | 同上 | 依然是深度编程的强力工具。保留作为显式覆盖选项。 |
| 3 | **DeepSeek（受限替代方案）** (`deepseek-v3.2`, `deepseek-chat-v3.1`) | `openrouter/deepseek` | 自主编程行为最接近的开源等价物。未接入默认链，请通过 `fallback_models` 添加。 |
| 4 | **MiniMax（强烈不推荐）** (`minimax-m2.7`, `minimax-m2.5`) | `opencode-go`, `opencode`, `openrouter/minimax` | 仅用于**实用工具**备用链（Explore, Librarian, `quick`）。一致性和长上下文管理问题使其成为 Hephaestus/Oracle 的糟糕替代品。请勿将深度智能体覆盖为 MiniMax。 |

> **DeepSeek ≻≻ MiniMax。** DeepSeek 保留了 GPT 的自主探索特性。MiniMax 在多步骤深度工作上会失去连贯性。MiniMax 仅适用于 grep 风格的实用工具智能体，仅此而已。

### Gemini 家族（视觉、不同的推理风格）

使用者：`visual-engineering`, `artistry`, Oracle (视觉备用), Multimodal-Looker。

| 优先级 | 模型 | 服务商 | 为什么 |
|---|---|---|---|
| 1 | `gemini-3.1-pro` (high) | `google`, `github-copilot`, `opencode`, `vercel` | 最适合 UI/UX、CSS、设计 Token、布局决策。`artistry` 类别**需要**这个家族。 |
| 2 | `gemini-3-flash` | 同上 | 快速变体，适用于写作/文档任务。 |
| 3 | **Qwen（替代方案）** (`qwen3.6-plus`, `qwen3.5-plus`) | `opencode-go`, `openrouter/qwen` | 未连接 Google 时最接近的具备视觉能力的替代品。使用不同的推理风格，但能胜任视觉任务。 |

> **这里没有 GLM/Kimi。** 它们不是视觉工作的 Gemini 替代品。请使用 Qwen。

---

## 速查表：替换规则

| 如果你失去了... | 切换到（按顺序） | 避免 |
|---|---|---|
| Claude Opus/Sonnet | Kimi K2.5/K2.6 → GLM 5 → Big Pickle | 较旧的 GPT 模型 |
| GPT-5.4/5.5 | GPT-5.3 Codex → DeepSeek v3.2 | MiniMax（实用工具工作除外） |
| Gemini 3.1 Pro | Qwen 3.6-plus / 3.5-plus | Claude/Kimi（视觉工作的推理风格错误） |
| Grok Code Fast 1 (Explore) | GPT-5.4 Mini Fast → MiniMax M2.7 Highspeed → Claude Haiku | Opus（巨大的成本浪费） |

---

## 智能体画像

来自 [`src/shared/model-requirements.ts`](../../src/shared/model-requirements.ts) 的准确运行时链。

### 沟通者型智能体（推荐 Claude / Kimi / GLM）

这些智能体拥有针对 Claude 优化的提示词：冗长、详细、机制驱动。它们需要能够可靠遵循复杂、多层指令的模型。

| 智能体 | 角色 | 备用链 |
|---|---|---|
| **Sisyphus** | 主编排器 | `anthropic\|github-copilot\|opencode\|vercel/claude-opus-4-7` (max) → `opencode-go\|vercel/kimi-k2.6` → `kimi-for-coding/k2p5` → `opencode\|moonshotai\|moonshotai-cn\|firmware\|ollama-cloud\|aihubmix\|vercel/kimi-k2.5` → `openai\|github-copilot\|opencode\|vercel/gpt-5.5` (medium) → `zai-coding-plan\|opencode\|vercel/glm-5` → `opencode/big-pickle` |
| **Metis** | 计划差距分析器 | `anthropic\|github-copilot\|opencode\|vercel/claude-sonnet-4-6` → `anthropic\|github-copilot\|opencode\|vercel/claude-opus-4-7` (max) → `openai\|github-copilot\|opencode\|vercel/gpt-5.5` (high) → `opencode-go\|vercel/glm-5.1` → `kimi-for-coding/k2p5` |

### 双提示词智能体（首选 Claude，支持 GPT）

这些智能体为 Claude 和 GPT 家族提供了独立的提示词。它们会自动检测你的模型并在运行时进行切换。

| 智能体 | 角色 | 备用链 |
|---|---|---|
| **Prometheus** | 战略规划器 | `anthropic\|github-copilot\|opencode\|vercel/claude-opus-4-7` (max) → `openai\|github-copilot\|opencode\|vercel/gpt-5.5` (high) → `opencode-go\|vercel/glm-5.1` → `google\|github-copilot\|opencode\|vercel/gemini-3.1-pro` |
| **Atlas** | 待办事项编排器 | `anthropic\|github-copilot\|opencode\|vercel/claude-sonnet-4-6` → `opencode-go\|vercel/kimi-k2.6` → `openai\|github-copilot\|opencode\|vercel/gpt-5.5` (medium) → `opencode-go\|vercel/minimax-m2.7` |

### 深度专家型智能体（推荐 GPT）

这些智能体是为 GPT 的原则驱动风格而构建的。它们的提示词假定自主的、目标导向的执行。**请勿覆盖为 Claude。**

| 智能体 | 角色 | 备用链 |
|---|---|---|
| **Hephaestus** | 自主深度工作者 | `openai\|github-copilot\|venice\|opencode\|vercel/gpt-5.5` (medium)（单条目链，需要这些服务商之一。工匠。） |
| **Oracle** | 架构顾问 | `openai\|github-copilot\|opencode\|vercel/gpt-5.5` (high) → `google\|github-copilot\|opencode\|vercel/gemini-3.1-pro` (high) → `anthropic\|github-copilot\|opencode\|vercel/claude-opus-4-7` (max) → `opencode-go\|vercel/glm-5.1` |
| **Momus** | 无情的评审员 | `openai\|github-copilot\|opencode\|vercel/gpt-5.5` (xhigh) → `anthropic\|github-copilot\|opencode\|vercel/claude-opus-4-7` (max) → `google\|github-copilot\|opencode\|vercel/gemini-3.1-pro` (high) → `opencode-go\|vercel/glm-5.1` |

### 实用工具执行器（速度重于智能）

这些智能体执行 grep、搜索和检索。它们有意使用最快、最便宜的可用模型。**不要将它们“升级”到 Opus**，那就像雇佣一名资深工程师来整理文件。

| 智能体 | 角色 | 备用链 |
|---|---|---|
| **Explore** | 快速代码库 grep | `openai/gpt-5.4-mini-fast` → `opencode-go/qwen3.5-plus` → `vercel/minimax-m2.7-highspeed` → `opencode-go\|vercel/minimax-m2.7` → `anthropic\|opencode\|vercel/claude-haiku-4-5` → `openai\|opencode\|vercel/gpt-5.4-nano` |
| **Librarian** | 文档/代码搜索 | 与 Explore 相同 |
| **Multimodal Looker** | 视觉/屏幕截图 | `openai\|opencode\|vercel/gpt-5.5` (medium) → `opencode-go\|vercel/kimi-k2.6` → `zai-coding-plan\|vercel/glm-4.6v` → `openai\|github-copilot\|opencode\|vercel/gpt-5-nano` |
| **Sisyphus-Junior** | 类别执行器 | `anthropic\|github-copilot\|opencode\|vercel/claude-sonnet-4-6` → `opencode-go\|vercel/kimi-k2.6` → `openai\|github-copilot\|opencode\|vercel/gpt-5.5` (medium) → `opencode-go\|vercel/minimax-m2.7` → `opencode/big-pickle` |

---

## 模型家族

### Claude 家族

善于沟通、遵循指令、结构化输出。最适合需要遵循复杂多步骤提示词的智能体。

| 模型 | 优势 |
| --------------------- | ---------------------------------------------------------------------------- |
| **Claude Opus 4.7** | 整体表现最佳。对复杂提示词的依从性最高。Sisyphus 的默认模型。 |
| **Claude Sonnet 4.6** | 更快、更便宜。日常任务 of 良好平衡。 |
| **Claude Haiku 4.5** | 快速且便宜。适用于快速任务和实用工具工作。 |
| **Kimi K2.6 / K2.5** | 行为与 Claude 非常相似。低成本下的优秀全能模型；K2.6 是目前 Sisyphus 链中的默认备用模型。 |
| **GLM 5** | 类似 Claude 的行为。适用于编排任务。 |

### GPT 家族

原则驱动、显式推理、深厚的技术能力。最适合在复杂问题上自主工作的智能体。

| 模型 | 优势 |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **GPT-5.3 Codex** | 深度编程的强力工具。自主探索。仍可用于深度类别和显式覆盖。 |
| **GPT-5.5** | 高智能、战略推理。Oracle、Momus 的默认模型，以及 Prometheus / Atlas 的关键备用模型。Momus 使用 xhigh 变体。 |
| **GPT-5.4 Mini** | 快速 + 强推理。适用于轻量级自主任务。quick 类别的默认模型。 |
| **GPT-5-Nano** | 极度便宜、快速。适用于简单的实用工具任务。 |

### 其他模型

| 模型 | 优势 |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Gemini 3.1 Pro** | 擅长视觉/前端任务。不同的推理风格。`visual-engineering` 和 `artistry` 的默认模型。 |
| **Gemini 3 Flash** | 快速。适用于文档搜索和轻量任务。 |
| **GPT-5.4 Mini Fast** | Explore 和 Librarian 智能体的默认模型。速度极快且具备推理能力的迷你模型。 |
| **MiniMax M2.7** | 快速且智能。用于 OpenCode Go 和 OpenCode Zen 实用工具备用链。 |
| **MiniMax M2.7 Highspeed** | 高速 OpenCode 目录条目，用于首选最快可用 MiniMax 路径的实用工具备用链。 |

### OpenCode Go

一项高级订阅服务（每月 10 美元），通过 OpenCode 的基础设施提供对中国前沿模型的可靠访问。

**可用模型：**

| 模型 | 使用场景 |
| ------------------------ | --------------------------------------------------------------------- |
| **opencode-go/kimi-k2.6** | 具备视觉能力、类似 Claude 的推理。由 Sisyphus, Atlas, Sisyphus-Junior, Multimodal Looker 使用。 |
| **opencode-go/glm-5.1** | 仅限文本的编排模型。由 Oracle, Prometheus, Metis, Momus 使用。 |
| **opencode-go/minimax-m2.7** | 极度便宜，响应迅速。用于 Atlas, Sisyphus-Junior, Explore 和 Librarian 的实用工具备用方案。 |
| **opencode-go/qwen3.5-plus** | Qwen 编程模型，在 GPT-5.4 Mini Fast 不可用时，作为 Explore 和 Librarian 的首个 OpenCode Go 实用工具备用模型。 |

**何时使用：**

OpenCode Go 模型作为中间选项出现在整个备用链中。根据智能体的不同，它们可以排在 GPT 之前、GPT 之后，或者作为更便宜的实用工具路径之前的最后一个结构化模型备用方案。

**仅限 Go 的场景：**

备用链中的某些模型标识符是特定服务商的别名。例如，`k2p5` 通过 `kimi-for-coding` 解析，而 `glm-5` 可以根据可用性通过 `zai-coding-plan`、`opencode` 或 `vercel` 解析。

### 关于免费层备用模型

你可能会在源代码或日志中看到诸如 `kimi-k2.5-free`、`minimax-m2.7`、`minimax-m2.7-highspeed` 或 `big-pickle` (GLM 4.6) 之类的模型名称。这些是备用链中特定服务商或经过速度优化的条目。

你不需要配置它们。系统包含这些条目是为了在你没有订阅所有付费服务时能够优雅降级。如果你拥有付费版本，付费版本将始终被优先选择。

---

## 任务类别

当智能体委派工作时，它们不会选择具体的模型名称，而是选择一个**类别**。该类别会自动映射到正确的模型。

| 类别 | 适用场景 | 默认模型 | 备用链 |
|---|---|---|---|
| `visual-engineering` | 前端、UI、CSS、设计 | `google/gemini-3.1-pro` (high) | Gemini → `zai-coding-plan/glm-5` → `claude-opus-4-7` (max) → `opencode-go/glm-5.1` → `kimi-for-coding/k2p5` |
| `artistry` | 创意、新颖的方法 | `google/gemini-3.1-pro` (high) | Gemini → `claude-opus-4-7` (max) → `gpt-5.5` |
| `ultrabrain` | 需要极限推理 | `openai/gpt-5.5` (xhigh) | GPT-5.5 xhigh → `gemini-3.1-pro` (high) → `claude-opus-4-7` (max) → `opencode-go/glm-5.1` |
| `deep` | 深度编程、复杂逻辑 | `openai/gpt-5.5` (medium) | GPT-5.5 → `claude-opus-4-7` (max) → `gemini-3.1-pro` (high) |
| `quick` | 简单、快速的任务 | `openai/gpt-5.4-mini` | GPT-5.4-mini → `claude-haiku-4-5` → `gemini-3-flash` → `opencode-go/minimax-m2.7` → `opencode/gpt-5-nano` |
| `unspecified-high` | 通用复杂工作 | `anthropic/claude-opus-4-7` (max) | Opus → `gpt-5.5` (high) → `zai-coding-plan/glm-5` → `kimi-for-coding/k2p5` → `opencode-go/glm-5.1` → `opencode/kimi-k2.5` → `moonshotai/kimi-k2.5` |
| `unspecified-low` | 通用标准工作 | `anthropic/claude-sonnet-4-6` | Sonnet → `gpt-5.3-codex` (medium) → `opencode-go/kimi-k2.6` → `google/gemini-3-flash` → `opencode-go/minimax-m2.7` |
| `writing` | 文本、文档、散文 | `kimi-for-coding/k2p5` | `gemini-3-flash` → `opencode-go/kimi-k2.6` → `claude-sonnet-4-6` → `opencode-go/minimax-m2.7` |

有关智能体如何将任务分发到类别的详细信息，请参阅 [编排系统指南](./orchestration.md)。

### Vercel AI Gateway 备用覆盖

`src/shared/model-requirements.ts` 在智能体和类别链的几乎每个兼容网关的备用条目中都包含了 `vercel`。请将其视为所列模型 ID 的通用额外服务商路径，而不是不同的模型家族。

---

## 自定义

### 示例 A：推荐的技术栈（OpenCode Go + OpenAI Plus/Pro）

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json",

  "agents": {
    // Sisyphus: Kimi K2.6 是 Claude 在编排方面的首选替代方案
    "sisyphus": {
      "model": "opencode-go/kimi-k2.6",
      "ultrawork": { "model": "opencode-go/kimi-k2.6" },
    },

    // Hephaestus: 需要 GPT。ChatGPT Plus 可以让你使用它。
    "hephaestus": { "model": "openai/gpt-5.5", "variant": "medium" },

    // 架构顾问: GPT 或 Claude Opus
    "oracle": { "model": "openai/gpt-5.5", "variant": "high" },

    // Prometheus 继承了 Sisyphus 的行为
    "prometheus": { "model": "opencode-go/kimi-k2.6" },

    // Atlas 同样善于沟通，Kimi 表现出色
    "atlas": { "model": "opencode-go/kimi-k2.6" },

    // 实用工具智能体保持低成本
    "explore": { "model": "opencode-go/qwen3.5-plus" },
    "librarian": { "model": "opencode-go/qwen3.5-plus" },
  },

  "categories": {
    "visual-engineering": { "model": "opencode-go/qwen3.6-plus" },  // Qwen 作为 Gemini 的替代方案
    "deep": { "model": "openai/gpt-5.5", "variant": "medium" },
    "ultrabrain": { "model": "openai/gpt-5.5", "variant": "xhigh" },
    "quick": { "model": "openai/gpt-5.4-mini" },
    "unspecified-low": { "model": "opencode-go/kimi-k2.6" },
    "unspecified-high": { "model": "opencode-go/kimi-k2.6" },
    "writing": { "model": "opencode-go/kimi-k2.6" },
  },

  "background_task": {
    "providerConcurrency": {
      "openai": 3,
      "opencode-go": 10,
    },
  },
}
```

### 示例 B：全原生（Anthropic + OpenAI + Google）

最高质量，最高成本。没有意外。

```jsonc
{
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-opus-4-7",
      "variant": "max",
    },
    "hephaestus": { "model": "openai/gpt-5.5", "variant": "medium" },
    "oracle": { "model": "openai/gpt-5.5", "variant": "high" },
  },
  "categories": {
    "visual-engineering": { "model": "google/gemini-3.1-pro", "variant": "high" },
    "deep": { "model": "openai/gpt-5.5", "variant": "medium" },
    "unspecified-high": { "model": "anthropic/claude-opus-4-7", "variant": "max" },
  },
}
```

### 示例 C：仅限 OpenCode Go（预算型，无 GPT）

最便宜的全栈路径。Hephaestus 将无法激活，请接受这一权衡。

```jsonc
{
  "agents": {
    "sisyphus": { "model": "opencode-go/kimi-k2.6" },
    "atlas": { "model": "opencode-go/kimi-k2.6" },
    // 完全省略 hephaestus，它需要 GPT。
    "oracle": { "model": "opencode-go/glm-5.1" },  // 降级但仍可运行
    "explore": { "model": "opencode-go/qwen3.5-plus" },
    "librarian": { "model": "opencode-go/qwen3.5-plus" },
  },
  "categories": {
    "visual-engineering": { "model": "opencode-go/qwen3.6-plus" },
    "deep": { "model": "opencode-go/kimi-k2.6" },  // 不够理想，Kimi 不是 GPT，但这是目前最好的选择
    "unspecified-high": { "model": "opencode-go/kimi-k2.6" },
    "unspecified-low": { "model": "opencode-go/kimi-k2.6" },
    "quick": { "model": "opencode-go/minimax-m2.7" },
    "writing": { "model": "opencode-go/kimi-k2.6" },
  },
}
```

### 示例 D：添加 DeepSeek 作为 GPT 替代方案

如果你拥有 OpenRouter，并希望在 GPT 不可用时将 DeepSeek 加入备用链中：

```jsonc
{
  "agents": {
    "oracle": {
      "model": "openai/gpt-5.5",
      "variant": "high",
      "fallback_models": [
        "anthropic/claude-opus-4-7",
        { "model": "openrouter/deepseek/deepseek-v3.2", "temperature": 0.7 },
        "opencode-go/glm-5.1",
      ],
    },
  },
}
```

`fallback_models` 接受普通模型字符串与包含 `variant`、`reasoningEffort`、`temperature`、`top_p`、`maxTokens`、`thinking` 的特定备用对象的混合数组。

---

### 安全与危险的覆盖操作

**安全**：相同个性类型：

- Sisyphus：Opus → Sonnet, Kimi K2.5/2.6, GLM 5（均为善于沟通的模型）
- Prometheus：Opus → GPT-5.5（自动切换到 GPT 提示词）
- Atlas：Claude Sonnet 4.6 → Kimi K2.6 → GPT-5.5（自动切换到 GPT 提示词）

**危险**：个性不匹配：

- **Sisyphus 覆盖为旧 of GPT 模型**：依然是糟糕的选择。GPT-5.4 和 GPT-5.5 是仅有的专用 GPT 提示词路径。
- **Hephaestus 覆盖为 Claude**：专为 Codex 的自主风格而构建。Claude 无法复制这一点。
- **Hephaestus 覆盖为 MiniMax**：MiniMax 在多步骤深度工作上会失去连贯性。**绝对不要这样做。**
- **Oracle 覆盖为 MiniMax**：出于同样的原因。Oracle 需要持续的推理；MiniMax 会偏离方向。
- **Explore 覆盖为 Opus**：巨大的成本浪费。Explore 需要速度，而不是智能。
- **Librarian 覆盖为 Opus**：同上。文档搜索不需要 Opus 级别的推理。
- **`visual-engineering` 覆盖为 Kimi/GLM**：错误的推理风格。如果 Gemini 不可用，请使用 Qwen，而不是类似 Claude 的模型。

---

## 模型解析是如何工作的

每个智能体都有一个备用链。系统按优先级顺序尝试模型，直到找到一个通过你连接的服务商可用的模型。你不需要为每个模型配置服务商。只需进行身份验证（`opencode auth login`），系统就会自动找出哪些模型可用以及在何处可用。

解析流水线（来自 [`src/shared/model-resolution-pipeline.ts`](../../src/shared/model-resolution-pipeline.ts)）：

```
1. 覆盖（Override）          → 用户的显式配置或 UI 选择的模型（仅限主要智能体）
2. 类别默认（Category default）  → 来自类别配置（当智能体设置了类别时）
3. 用户 fallback_models     → 在硬编码链之前尝试配置的字符串/对象
4. 服务商备用（Provider fallback） → AGENT_MODEL_REQUIREMENTS / CATEGORY_MODEL_REQUIREMENTS
5. 系统默认（System default）    → 终极安全网
```

核心智能体标签页循环通过注入的运行时顺序字段是确定性的。固定的优先级顺序为 Sisyphus（顺序：0）、Hephaestus（顺序：1）、Prometheus（顺序：2）和 Atlas（顺序：3），然后其余智能体依次排列。

你的显式配置始终胜出。如果你为智能体设置了特定模型，即使解析数据未热身，该选择也会优先。

变体和 `reasoningEffort` 覆盖会被规范化为模型支持的值，因此跨服务商的覆盖会优雅降级，而不是直接报错。

模型能力基于 `models.dev`，具有可刷新的缓存和能力诊断。使用 `bunx oh-my-opencode refresh-model-capabilities` 更新缓存，或配置 `model_capabilities.auto_refresh_on_start` 在启动时刷新。

要查看你的智能体实际将使用哪些模型，请运行 `bunx oh-my-opencode doctor`。这将显示基于你当前身份验证和配置的有效模型解析。

```
智能体请求 → 用户覆盖（如果配置了） → 备用链 → 系统默认
```

### 基于文件的提示词

你可以使用 `prompt` 字段中的 `file://` URL 从外部文件加载智能体系统提示词，或者使用 `prompt_append` 追加额外内容。`prompt_append` 字段也适用于类别。

```jsonc
{
  "agents": {
    "sisyphus": {
      "prompt": "file:///path/to/custom-prompt.md",
    },
    "oracle": {
      "prompt_append": "file:///path/to/additional-context.md",
    },
  },
  "categories": {
    "deep": {
      "prompt_append": "file:///path/to/deep-category-append.md",
    },
  },
}
```

文件内容在运行时加载并注入到智能体的系统提示词中。支持家目录的 `~` 展开和相对 `file://` 路径。

---

## 另请参阅

- [安装指南](./installation.md) ：设置与身份验证
- [编排系统指南](./orchestration.md) ：智能体如何将任务分发到类别
- [配置参考](../reference/configuration.md) ：完整的配置选项
- [`src/shared/model-requirements.ts`](../../src/shared/model-requirements.ts) ：备用链的单一事实来源
