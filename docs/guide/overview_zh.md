# 什么是 Oh My OpenAgent？

Oh My OpenAgent 是一个面向 OpenCode 的多模型智能体编排框架。它将单个 AI 智能体转化为一个协同工作的开发团队，切实交付代码。

不绑定 Claude。不绑定 OpenAI。不绑定任何特定厂商。

只有更好的结果、更低成本的模型和真正的编排。

---

## 快速开始

### 安装

将以下内容粘贴到您的大语言模型智能体对话中：

```
Install and configure oh-my-openagent by following the instructions here:
https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/refs/heads/dev/docs/guide/installation.md
```

或者阅读完整的[安装指南](./installation.md)以进行手动设置、服务商身份验证和故障排除。

### 您的第一个任务

安装完成后，只需输入：

```
ultrawork
```

就是这样。智能体会解决所有问题：探索您的代码库，研究模式，实现功能，并通过诊断进行验证。持续工作，直到完成。

想要更多控制？按下 **Tab** 键进入[普罗米修斯（Prometheus）模式](./orchestration.md)进行基于访谈的规划，然后运行 `/start-work` 进行完整编排。

---

## 核心哲学：打破束缚

我们过去常把这称为“加强版的 Claude Code”。那是错误的。

这并不是为了让 Claude Code 变得更好。它是为了打破“单一模型、单一服务商、单一工作方式就足够了”的观念。Anthropic 想把您锁在他们的生态里。OpenAI 也想把您锁在他们的生态里。每个人都想把您锁在他们的生态里。

Oh My OpenAgent 不玩这种游戏。它跨模型进行编排，为不同的工作挑选最合适的大脑。Claude 用于编排，GPT 用于深度推理，Gemini 用于前端，GPT-5.4 Mini 用于快速任务。所有模型自动协同工作。

---

## 工作原理：智能体编排

Oh My OpenAgent 不再让单个智能体包揽所有工作，而是使用**根据任务类型相互委派的专业智能体**。

**系统架构：**

```
用户请求
    ↓
[IntentGate] - 分类您实际想要的操作
    ↓
[Sisyphus] - 主编排器，规划并委派任务
    ↓
    ├─→ [Prometheus] - 战略规划（访谈模式）
    ├─→ [Atlas] - 待办事项编排与执行
    ├─→ [Oracle] - 架构咨询
    ├─→ [Librarian] - 文档/代码搜索
    ├─→ [Explore] - 快速代码库 grep
    └─→ [基于类别的智能体] - 按任务类型进行专业化分工
```

当 Sisyphus 向子智能体委派任务时，它不会选择具体的模型名称。它会选择一个**类别**：`visual-engineering`、`ultrabrain`、`deep`、`artistry`、`quick`、`unspecified-low`、`unspecified-high`、`writing`。该类别会自动映射到正确的模型。您无需进行任何手动操作。

要深入了解智能体如何协同工作，请参阅[编排系统指南](./orchestration.md)。

---

## 认识智能体

### Sisyphus：纪律智能体

得名于希腊神话。他每天都在推巨石。永不停歇，永不放弃。

Sisyphus 是您的主编排器。他进行规划，向专家智能体委派任务，并通过积极的并行执行推动任务直至完成。他不会半途而废，不会分心，他会彻底完成任务。

**推荐模型：**

- **Claude Opus 4.7**：最佳的整体体验。Sisyphus 是基于针对 Claude 优化的提示词构建的。
- **Kimi K2.6** / **K2.5**：极佳的类 Claude 替代方案。K2.6 是目前主 Sisyphus 链中的默认备用模型，许多用户仅运行 K2.6 或 K2.5/K2.6 组合。
- **GLM 5**：可靠的选择，特别是通过 Z.ai 运行时。

Sisyphus 在 Claude Opus 4.7、Kimi K2.6（或 K2.5）和 GLM 5.1 上运行效果最好。GPT-5.4 和 GPT-5.5 现在拥有专属的提示词路径，但较旧 GPT 模型仍然不太适合，应该路由到 Hephaestus。

### Hephaestus：正统匠人

这个名字带有刻意的讽刺意味。Anthropic 因为这个项目阻止了 OpenCode 使用他们的 API。因此，团队构建了一个自主的 GPT 原生智能体作为替代。

Hephaestus 运行在 GPT-5.5 上。给他一个目标，而不是具体的步骤。他会自行探索代码库，研究模式，并端到端地执行任务，无需手把手的指导。他是正统匠人，因为他诞生于需要，而非特权。

当您需要深度的架构推理、跨多个文件的复杂调试或跨领域知识综合时，请使用 Hephaestus。当工作需要 GPT-5.5 的特定优势时，请显式切换到他。

**为什么这优于原生的 Codex CLI：**

- **多模型编排。** 纯粹的 Codex 是单模型的。OmO 会自动将不同的任务路由到不同的模型。GPT 用于深度推理，Gemini 用于前端，GPT-5.4 Mini 用于速度。为不同的工作挑选最合适的大脑。
- **后台智能体。** 并行启动 5 个以上的智能体。这是 Codex 根本无法做到的。当一个智能体编写代码时，另一个智能体研究模式，还有一个智能体检查文档。就像一个真正的开发团队。
- **类别系统。** 任务根据意图而非模型名称进行路由。`visual-engineering` 使用 Gemini，`ultrabrain` 使用 GPT-5.5 xhigh，`deep` 使用 GPT-5.5，`artistry` 使用 Gemini，`quick` 使用 GPT-5.4 Mini，`unspecified-low` 使用快速且便宜的模型，`unspecified-high` 使用 Claude Opus，`writing` 使用针对文本优化的模型。无需手动调整。
- **积累的智慧。** 子智能体会从以前的结果中学习。在任务 1 中发现的约定会传递给任务 5。早期犯的错误不会重复。系统在工作时会变得越来越聪明。

### Prometheus：战略规划者

Prometheus 会像真正的工程师一样对您进行访谈。提出澄清性问题，识别范围和模糊之处。在动用任何一行代码之前，构建一份详细的计划。

按下 **Tab** 键进入 Prometheus 模式，或者在 Sisyphus 中输入 `@plan "您的任务"`。

### Atlas：指挥官

Atlas 执行 Prometheus 的计划。将任务分发给专业的子智能体。在不同任务之间积累学习成果。独立验证任务的完成情况。

运行 `/start-work` 在您最新的计划上激活 Atlas。

### Oracle：顾问

只读的高智商顾问，用于架构决策和复杂调试。在面临不熟悉的模式、安全问题或多系统权衡时咨询 Oracle。

### 辅助角色

- **Metis**：差距分析器。在计划最终确定之前，捕获 Prometheus 遗漏的内容。
- **Momus**：无情的评审员。根据清晰度、验证和上下文标准验证计划。
- **Explore**：快速代码库 grep。使用专注于速度的模型进行模式发现。
- **Librarian**：文档和开源代码搜索。保持对库 API 和最佳实践的最新了解。
- **Multimodal Looker**：视觉和截图分析。

---

## 工作模式

### 极速工作（Ultrawork）模式：适合懒人

输入 `ultrawork` 或只需输入 `ulw`。就是这样。

智能体会解决所有问题。探索您的代码库，研究模式，实现功能，并通过诊断进行验证。持续工作，直到完成。

这是“直接去做”的模式。全自动运行。您不需要深入思考，因为智能体会为您进行深度思考。

### 普罗米修斯（Prometheus）模式：适合严谨之人

按下 **Tab** 键进入 Prometheus 模式。

Prometheus 会像真正的工程师一样对您进行访谈。提出澄清性问题，识别范围和模糊之处。在动用任何一行代码之前，构建一份详细的计划。

然后运行 `/start-work`，Atlas 将接管工作。任务被分发给专业的子智能体。每个任务的完成都会被独立验证。学习成果在不同任务之间积累。进度在不同会话之间进行跟踪。

对于多天项目、关键的生产环境变更、复杂的重构，或者当您想要一个有记录的决策轨迹时，请使用 Prometheus。

---

## 智能体模型匹配

不同的智能体在不同的模型上运行效果最好。Oh My OpenAgent 会自动分配最佳模型，但您可以自定义所有内容。

### 默认配置

模型在安装时自动配置。交互式安装程序会询问您拥有哪些服务商，然后为每个智能体和类别生成最佳的模型分配。

在运行时，备用链可确保即使您首选的服务商宕机，工作也能继续进行。每个智能体都有一个服务商优先级链。系统会按顺序尝试服务商，直到找到可用的模型。

### 自定义模型配置

您可以在配置中覆盖特定的智能体或类别：

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json",

  "agents": {
    // 主编排器：Claude Opus 或 Kimi K2.6 效果最好
    "sisyphus": {
      "model": "kimi-for-coding/k2p5",
      "ultrawork": { "model": "anthropic/claude-opus-4-7", "variant": "max" },
    },

    // 研究智能体：便宜的模型即可
    "librarian": { "model": "google/gemini-3-flash" },
    "explore": { "model": "github-copilot/grok-code-fast-1" },

    // 架构咨询：GPT 或 Claude Opus
    "oracle": { "model": "openai/gpt-5.5", "variant": "high" },
  },

  "categories": {
    // 前端/UI 工作：Gemini 在视觉任务中占主导地位
    "visual-engineering": {
      "model": "google/gemini-3.1-pro",
      "variant": "high",
    },

    // 硬逻辑和架构：GPT-5.5 xhigh
    "ultrabrain": { "model": "openai/gpt-5.5", "variant": "xhigh" },

    // 自主研究与执行
    "deep": { "model": "openai/gpt-5.5", "variant": "medium" },

    // 创意和设计工作
    "artistry": { "model": "google/gemini-3.1-pro", "variant": "high" },

    // 快速任务：快速且便宜
    "quick": { "model": "openai/gpt-5.4-mini" },

    // 低工作量备用：最便宜的可用模型
    "unspecified-low": { "model": "openai/gpt-5.4-mini" },

    // 高工作量备用：最佳可用模型
    "unspecified-high": { "model": "anthropic/claude-opus-4-7", "variant": "max" },

    // 散文和文档
    "writing": { "model": "anthropic/claude-opus-4-7", "variant": "high" },
  },
}
```

### 模型家族

**类 Claude 模型**（遵循指令、结构化输出）：

- Claude Opus 4.7, Claude Haiku 4.5
- Kimi K2.6 / K2.5：表现与 Claude 非常相似
- GLM 5：类 Claude 行为，适合广泛的任务

**GPT 模型**（显式推理、原则驱动）：

- GPT-5.5：深度编码主力，Hephaestus 所需，且为 Oracle 的默认模型
- GPT-5.4 Mini：快速且便宜的实用任务模型

**不同行为的模型**：

- Gemini 3.1 Pro：擅长视觉/前端任务
- MiniMax M2.7 / M2.7-highspeed：对于实用任务快速且智能
- Grok Code Fast 1：针对代码 grep/搜索进行了优化

请参阅[智能体-模型匹配指南](./agent-model-matching.md)以获取有关哪些模型最适合每个智能体、安全与危险的覆盖以及服务商优先级链的完整详细信息。

---

## 为什么它优于纯粹的 Claude Code

Claude Code 很好。但它只是一个运行单一模型的单个智能体，独自完成所有工作。

Oh My OpenAgent 将其转变为一个协同工作的团队：

**并行执行。** Claude Code 一次只处理一件事。OmO 并行启动后台智能体：研究、实现和验证同时进行。就像拥有 5 个工程师而不是 1 个。

**哈希锚定编辑。** 当模型无法完全重现行时，Claude Code 的编辑工具会失败。OmO 的 `LINE#ID` 内容哈希在应用之前验证每次编辑。仅凭这一项改变，Grok Code Fast 1 的成功率就从 6.7% 提升到了 68.3%。

**IntentGate。** Claude Code 接收您的提示词并直接运行。OmO 首先对您的真实意图进行分类：研究、实现、调查、修复，然后进行相应路由。更少的误解，更好的结果。

**LSP + AST 工具。** 工作区级别的重命名、转到定义、查找引用、构建前诊断、AST 感知代码重写。原生 Claude Code 所不具备的 IDE 精度。

**带有嵌入式 MCP 的技能。** 每个技能都带有自己的 MCP 服务端，范围限定在任务内。上下文窗口保持干净，而不是随着每个工具的使用而膨胀。

**纪律执行。** 待办事项强制执行器将闲置的智能体拉回工作状态。注释检查器清除 AI 废话。Ralph 循环持续运行，直到 100% 完成。系统不会让智能体偷懒。

**根本优势。** 模型有不同的性格。Claude 思考深邃，GPT 架构推理强，Gemini 擅长可视化，Haiku 动作迅速。单模型工具强迫您为所有任务选择一种性格。Oh My OpenAgent 利用了所有这些模型，按任务类型进行路由。这并不是临时的权宜之计，随着模型的进一步专业化，这是唯一合理的架构。多模型编排与单模型限制之间的差距每个月都在扩大。我们押注于这个未来。

---

## IntentGate

在对任何请求采取行动之前，Sisyphus 会对您的真实意图进行分类。

您是在请求研究？实现？调查？还是修复？Intent Gate 会弄清楚您实际想要什么，而不仅仅是您输入的字面词汇。这意味着智能体能够理解上下文、细微差别以及您请求背后的真实目标。

Claude Code 没有这个功能。它接收您的提示词并直接运行。Oh My OpenAgent 先思考，后行动。

---

## 下一步

- **[安装指南](./installation.md)**：完整的设置说明、服务商身份验证和故障排除
- **[编排指南](./orchestration.md)**：深入探讨智能体协作、使用 Prometheus 进行规划以及使用 Atlas 进行执行
- **[智能体-模型匹配指南](./agent-model-matching.md)**：哪些模型最适合每个智能体以及如何进行自定义
- **[团队模式指南](./team-mode.md)**：并行多智能体协同（默认关闭）；12 个 `team_*` 工具、共享邮箱、共享任务列表、可选的 tmux 布局
- **[配置参考](../reference/configuration.md)**：完整的配置选项及示例
- **[功能参考](../reference/features.md)**：完整的功能文档
- **[宣言](../manifesto.md)**：项目背后的哲学

---

**准备好开始了吗？** 输入 `ultrawork`，看看协同工作的 AI 团队能做些什么。
