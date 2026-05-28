# Oh-My-OpenAgent 功能参考

## 智能体

Oh-My-OpenAgent 提供了 11 个专业的 AI 智能体。每个智能体都拥有独特的专业领域、优化的模型和工具权限。

### 核心智能体

核心智能体标签页的循环是通过注入的运行时顺序字段来确定的。固定的优先级顺序为 Sisyphus（顺序：0）、Hephaestus（顺序：1）、Prometheus（顺序：2）和 Atlas（顺序：3）。其余智能体排在这四个稳定核心顺序之后。

| 智能体 | 模型 | 用途 |
| --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sisyphus** | `claude-opus-4-7` | 默认的编排器。通过使用专业的子智能体并进行积极的并行执行，来规划、委派和执行复杂的任务。采用带有深度思考（32k 预算）的待办事项驱动型工作流。备用模型链：`opencode-go/kimi-k2.6` → `kimi-for-coding/k2p5` → `opencode\|moonshotai\|moonshotai-cn\|firmware\|ollama-cloud\|aihubmix/kimi-k2.5` → `openai\|github-copilot\|opencode/gpt-5.5 (medium)` → `zai-coding-plan\|opencode/glm-5` → `opencode/big-pickle`。 |
| **Hephaestus** | `gpt-5.5` | 合法工匠。受 AmpCode 深度模式启发的自主深度工作者。以目标为导向进行执行，在行动前进行彻底的研究。探索代码库模式，端到端地完成任务，不会过早停止。以希腊锻造与手工艺之神命名。需要支持 GPT 的服务商。 |
| **Oracle** | `gpt-5.5` | 架构决策、代码审查、调试。只读咨询，具有出色的逻辑推理和深度分析能力。受 AmpCode 启发。备用模型链：`google\|github-copilot\|opencode/gemini-3.1-pro (high)` → `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `opencode-go/glm-5.1`。 |
| **Librarian** | `gpt-5.4-mini-fast` | 多仓库分析、文档查询、开源实现示例。对代码库有深入的理解，并提供基于证据的回答。备用模型链：`opencode-go/qwen3.5-plus` → `opencode-go/minimax-m2.7` → `anthropic\|opencode/claude-haiku-4-5` → `openai\|opencode/gpt-5.4-nano`。 |
| **Explore** | `gpt-5.4-mini-fast` | 快速代码库探索和上下文 grep。备用模型链：`opencode-go/qwen3.5-plus` → `opencode-go/minimax-m2.7` → `anthropic\|opencode/claude-haiku-4-5` → `openai\|opencode/gpt-5.4-nano`。 |
| **Multimodal-Looker** | `gpt-5.5` | 视觉内容专家。分析 PDF、图像、图表以提取信息。备用模型链：`opencode-go/kimi-k2.6` → `zai-coding-plan/glm-4.6v` → `openai\|github-copilot\|opencode/gpt-5-nano`。 |

### 规划智能体

| 智能体 | 模型 | 用途 |
| -------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prometheus** | `claude-opus-4-7` | 带有访谈模式的战略规划器。通过迭代提问创建详细的工作计划。备用模型链：`openai\|github-copilot\|opencode/gpt-5.5 (high)` → `opencode-go/glm-5.1` → `google\|github-copilot\|opencode/gemini-3.1-pro`。 |
| **Metis** | `claude-sonnet-4-6` | 规划顾问，负责前期规划分析。识别隐藏的意图、歧义和 AI 失败点。备用模型链：`anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `openai\|github-copilot\|opencode/gpt-5.5 (high)` → `opencode-go/glm-5.1` → `kimi-for-coding/k2p5`。 |
| **Momus** | `gpt-5.5` | 规划审查员，根据清晰度、可验证性和完整性标准来验证规划。备用模型链：`anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `google\|github-copilot\|opencode/gemini-3.1-pro (high)` → `opencode-go/glm-5.1`。 |

### 编排智能体

| 智能体 | 模型 | 用途 |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Atlas** | `claude-sonnet-4-6` | 待办事项列表编排器。系统地执行规划好的任务，管理待办事项并协调工作。备用模型链：`opencode-go/kimi-k2.6` → `openai\|github-copilot\|opencode/gpt-5.5 (medium)` → `opencode-go/minimax-m2.7`。 |
| **Sisyphus-Junior** | _（取决于类别）_ | 类别生成的执行器。根据任务类别（视觉工程、快速、深度等）自动选择模型。其内置的通用备用模型链为 `anthropic\|github-copilot\|opencode/claude-sonnet-4-6` → `opencode-go/kimi-k2.6` → `openai\|github-copilot\|opencode/gpt-5.5 (medium)` → `opencode-go/minimax-m2.7` → `opencode/big-pickle`。 |

### 调用智能体

主智能体会自动调用这些智能体，但你也可以显式地调用它们：

```
Ask @oracle to review this design and propose an architecture
Ask @librarian how this is implemented - why does the behavior keep changing?
Ask @explore for the policy on this feature
```

### 工具限制

| 智能体 | 限制 |
| ----------------- | --------------------------------------------------------------------------------------- |
| oracle | 只读：无法写入、编辑或委派（拦截：write、edit、task、call_omo_agent） |
| librarian | 无法写入、编辑或委派（拦截：write、edit、task、call_omo_agent） |
| explore | 无法写入、编辑或委派（拦截：write、edit、task、call_omo_agent） |
| multimodal-looker | 允许列表：仅限 `read` |
| atlas | 无法委派（拦截：task、call_omo_agent） |
| momus | 无法写入、编辑 or 委派（拦截：write、edit、task） |

### 后台智能体

在后台运行智能体并继续工作：

- 让 GPT 进行调试，同时让 Claude 尝试不同的方法
- 让 Gemini 编写前端，同时让 Claude 处理后端
- 启动大规模并行搜索，继续进行实现，并在结果就绪时使用它们

```
# 在后台启动
task(subagent_type="explore", load_skills=[], prompt="Find auth implementations", run_in_background=true)

# 继续工作...
# 系统在完成时发出通知

# 在需要时检索结果
background_output(task_id="bg_abc123")
```

#### 使用 Tmux 进行视觉多智能体协作

启用 `tmux.enabled` 以在独立的 tmux 窗格中查看后台智能体：

```json
{
  "tmux": {
    "enabled": true,
    "layout": "main-vertical"
  }
}
```

在 tmux 内部运行时：

- 后台智能体在新窗格中生成
- 实时观察多个智能体的工作
- 每个窗格实时显示智能体的输出
- 智能体完成时自动清理
- **稳定的智能体顺序**：核心智能体标签页循环默认依次为 Sisyphus、Hephaestus、Prometheus、Atlas，并可通过 `agent_order` 进行自定义

在 cmux（`cmux omo`）内部运行时，相同的窗格集成会通过 cmux 的 tmux 兼容命令进行路由。OMO 会从 `CMUX_SOCKET_PATH` 或 cmux 提供的 `TMUX` 值中检测 cmux 环境，因此即使没有安装真正的 `tmux` 二进制文件，`tmux.enabled` 也可以创建 cmux 窗格。

在 `oh-my-opencode.jsonc` 中自定义智能体模型、提示词和权限。

### 团队模式（实验性，默认关闭）

单个智能体速度很快。而一个协同工作的团队则是具有毁灭性效率的。

**团队模式**将 oh-my-openagent 从“单个智能体带子智能体”转变为真正的多智能体系统。主智能体编排一个由特定领域专家组成的团队，所有成员**并行**运行，并通过专用工具（`team_create`、`team_send_message`、`team_task_create`、`team_status` 等）进行通信。你可以通过 tmux 布局实时查看每个成员的工作，该布局将每个成员的会话输出流式传输到专用窗格中。

请参阅 **[团队模式指南](../guide/team-mode.md)** 以了解配置、团队规范格式、生命周期、边界和存储布局。

### 架构快照（当前）

- **功能模块**：`src/features/` 拥有 20 个模块。
- **工具系统**：`src/tools/` 拥有 16 个工具目录，根据配置开关生成 **20 到 39 个工具**。
- **钩子系统**：5 级组合包含 **54 个基础钩子**。启用团队模式后将变为 **61 个**（额外的工具守卫 + 转换器 + `src/plugin/event.ts` 中的直接团队会话事件处理器）。
- **MCP 系统**：3 级架构：内置远程 MCP（`websearch`、`context7`、`grep_app`）、`.mcp.json` 加载器以及来自 `SKILL.md` 前言的技能嵌入式 MCP。
- **管理器**：插件启动时创建 4 个管理器：TmuxSessionManager、BackgroundManager、SkillMcpManager、ConfigHandler。
- **配置流水线**：按顺序进行 6 个阶段：服务商、插件组件、智能体、工具、MCP、命令。
- **核心智能体规范顺序**：Sisyphus、Hephaestus、Prometheus、Atlas。
- **OpenClaw**：针对 Discord、Telegram、HTTP 和 shell 的双向集成，带有回复监听守护进程。

## 类别系统

类别（Category）是针对特定领域进行优化的智能体配置预设。与其将所有工作都委派给单个 AI 智能体，不如调用针对任务性质定制的专家，这样效率要高得多。

### 什么是类别以及为什么它们很重要

- **类别**：“这是什么类型的工作？”（决定模型、温度、提示词思维方式）
- **技能**：“需要什么工具和知识？”（注入专业知识、MCP 工具、工作流）

通过结合这两个概念，你可以通过 `task` 生成最优的智能体。

### 内置类别

| 类别 | 默认模型 | 使用场景 |
| -------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `visual-engineering` | `google/gemini-3.1-pro` (high) | 前端、UI/UX、设计、样式、动画 |
| `ultrabrain` | `openai/gpt-5.5` (xhigh) | 深度逻辑推理，需要广泛分析的复杂架构决策 |
| `deep` | `openai/gpt-5.5` (medium) | 针对需要深度研究的棘手问题，以目标为导向进行自主问题解决。每次调用仅限一个目标和一个交付物，多个目标必须作为并行的 `deep` 调用展开，绝不能捆绑在一起。 |
| `artistry` | `google/gemini-3.1-pro` (high) | 高度创意/艺术性的任务，新颖的想法 |
| `quick` | `openai/gpt-5.4-mini` | 琐碎的任务：单文件更改、拼写错误修复、简单修改 |
| `unspecified-low` | `anthropic/claude-sonnet-4-6` | 不适合其他类别的任务，需要较低的投入 |
| `unspecified-high` | `anthropic/claude-opus-4-7` (max) | 不适合其他类别的任务，需要较高的投入 |
| `writing` | `kimi-for-coding/k2p5` | 文档、散文、技术写作 |

### 用法

在调用 `task` 工具时指定 `category` 参数。

```typescript
task({
  category: "visual-engineering",
  prompt: "Add a responsive chart component to the dashboard page",
});
```

### 自定义类别

你可以在插件配置文件中定义自定义类别。在重命名过渡期间，`oh-my-openagent.json[c]` 和旧版 `oh-my-opencode.json[c]` 基准名称均可被识别。

#### 类别配置模式

| 字段 | 类型 | 描述 |
| ------------------- | ------- | --------------------------------------------------------------------------- |
| `description` | string | 类别用途的人类可读描述。在任务提示词中显示。 |
| `model` | string | 要使用的 AI 模型 ID（例如 `anthropic/claude-opus-4-7`） |
| `fallback_models` | string\|array | API 错误时的备用模型。支持字符串，或包含每个模型设置的字符串与对象条目的混合数组 |
| `variant` | string | 模型变体（例如 `max`、`xhigh`） |
| `temperature` | number | 创造力水平（0.0 ~ 2.0）。越低越具有确定性。 |
| `top_p` | number | 核采样参数（0.0 ~ 1.0） |
| `prompt_append` | string | 选择此类别时要追加到系统提示词的内容 |
| `thinking` | object | 思考模型配置（`{ type: "enabled", budgetTokens: 16000 }`） |
| `reasoningEffort` | string | 推理投入水平（`low`、`medium`、`high`） |
| `textVerbosity` | string | 文本冗长水平（`low`、`medium`、`high`） |
| `tools` | object | 工具使用控制（使用 `{ "tool_name": false }` 禁用） |
| `maxTokens` | number | 最大响应 token 数 |
| `max_prompt_tokens` | number | 委派任务的最大提示词 token 数 |
| `is_unstable_agent` | boolean | 将智能体标记为不稳定：强制进入后台模式以便进行监控 |
| `disable` | boolean | 禁用此类别并将其排除在任务委派之外 |

#### 配置示例

```jsonc
{
  "categories": {
    // 1. 定义新的自定义类别
    "korean-writer": {
      "model": "google/gemini-3-flash",
      "temperature": 0.5,
      "prompt_append": "You are a Korean technical writer. Maintain a friendly and clear tone.",
    },

    // 2. 覆盖现有类别（更改模型）
    "visual-engineering": {
      "model": "openai/gpt-5.5",
      "temperature": 0.8,
    },

    // 3. 配置思考模型并限制工具
    "deep-reasoning": {
      "model": "anthropic/claude-opus-4-7",
      "thinking": {
        "type": "enabled",
        "budgetTokens": 32000,
      },
      "tools": {
        "websearch_web_search_exa": false,
      },
    },
  },
}
```

### Sisyphus-Junior 作为委派执行器

当你使用类别时，一个名为 **Sisyphus-Junior** 的特殊智能体会执行该工作。

- **特征**：无法将任务**重新委派**给其他智能体。
- **目的**：防止无限委派循环，并确保专注于分配的任务。

## 高级配置

### 重命名兼容性

发布的 npm 包和二进制文件仍为 `oh-my-opencode`。在 `opencode.json` 内部，兼容层现在首选插件入口 `oh-my-openagent`，而旧版 `oh-my-opencode` 条目仍会加载并显示警告。在过渡期间，插件配置文件（`oh-my-openagent.json[c]` 或旧版 `oh-my-opencode.json[c]`）均可被识别。运行 `bunx oh-my-opencode doctor` 以检查旧版包名警告。

### 备用模型

为每个智能体配置备用模型链，数组中可以混合使用普通模型字符串和针对每个模型的对象：

```jsonc
{
  "agents": {
    "sisyphus": {
      "fallback_models": [
        "opencode/glm-5",
        { "model": "openai/gpt-5.5", "variant": "high" },
        { "model": "anthropic/claude-sonnet-4-6", "thinking": { "type": "enabled", "budgetTokens": 64000 } }
      ]
    }
  }
}
```

当模型报错时，运行时可以遍历配置的备用数组。对象条目允许你调整备用模型本身，而不仅仅是更换模型名称。

该插件使用两个独立的备用系统：

- **model-fallback**：在聊天参数中主动进行模型链选择。
- **runtime-fallback**：在服务商/API 行为发生运行时故障后进行响应式恢复。

### 基于文件的提示词

在 `prompt` 字段中使用 `file://` URL 从外部文件加载智能体系统提示词，或者使用 `prompt_append` 追加额外内容。`prompt_append` 字段也适用于类别。

```jsonc
{
  "agents": {
    "sisyphus": {
      "prompt": "file:///path/to/custom-prompt.md"
    },
    "oracle": {
      "prompt_append": "file:///path/to/additional-context.md"
    }
  },
  "categories": {
    "deep": {
      "prompt_append": "file:///path/to/deep-category-append.md"
    }
  }
}
```

支持针对主目录的 `~` 展开以及相对 `file://` 路径。

适用于：
- 将提示词与配置分开进行版本控制
- 在不同项目之间共享提示词
- 保持配置文件简洁
- 添加特定于类别的上下文，而无需复制基础提示词

文件内容在运行时加载并注入到智能体的系统提示词中。

### 会话恢复

系统会自动从常见的会话故障中恢复，无需用户干预：

- **缺失工具结果**：重建可恢复的工具状态，并跳过无效的工具部分 ID，而不是使整个恢复过程失败
- **思考块违规**：从 API 思考块不匹配中恢复
- **空消息**：在内容缺失时重建消息历史记录
- **上下文窗口限制**：通过智能压缩优雅地处理 Claude 上下文窗口超出错误
- **JSON 解析错误**：从格式错误的工具输出中恢复

恢复在智能体执行期间透明地发生。你看到的是结果，而不是失败。

## 技能

技能通过嵌入式 MCP 服务器和详细说明提供专业的工作流。技能是一种将特定领域的**专业知识（上下文）**和**工具（MCP）**注入智能体的机制。

### 内置技能

| 技能 | 触发词 | 描述 |
| ------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **git-master** | commit, rebase, squash, "who wrote", "when was X added" | Git 专家。检测提交风格，拆分原子提交，制定变基策略。三个专业角色：提交架构师（原子提交、依赖顺序、风格检测）、变基外科医生（历史重写、冲突解决、分支清理）、历史考古学家（寻找特定更改引入的时间/位置）。 |
| **playwright** | 浏览器任务、测试、截图 | 通过 Playwright MCP 实现浏览器自动化。必须用于浏览器验证、浏览、网页抓取、测试和截图。 |
| **agent-browser** | agent-browser 上的浏览器任务 | 通过 `agent-browser` CLI 实现浏览器自动化。涵盖导航、快照、截图、网络检查和脚本交互。 |
| **dev-browser** | 有状态的浏览器脚本编写 | 具有持久页面状态的浏览器自动化，适用于迭代工作流和已认证的会话。 |
| **frontend-ui-ux** | UI/UX 任务、样式设计 | 设计师出身的开发人员角色。即使没有设计模型，也能制作出令人惊叹的 UI/UX。强调大胆的美学方向、独特的排版、凝聚力的配色方案。 |
| **review-work** | "review work", "review my work", "QA my work" | 实现后审查编排器。启动 5 个并行的后台子智能体进行全面审查：目标验证、代码质量、安全、动手 QA 和上下文挖掘。所有审查必须全部通过，审查才算通过。 |
| **ai-slop-remover**| "remove AI slop", "de-AI", "humanize" | 从文件中移除 AI 生成的代码异味，同时保留功能。识别并消除冗长的注释、冗余的错误处理、过度设计的模式以及通用的 AI 措辞。 |

#### git-master 核心原则

**默认多次提交**：

```
3+ 个文件 -> 必须分为 2+ 次提交
5+ 个文件 -> 必须分为 3+ 次提交
10+ 个文件 -> 必须分为 5+ 次提交
```

**自动风格检测**：

- 分析最近 30 次提交的语言（韩语/英语）和风格（语义化/普通/简短）
- 自动匹配你仓库的提交规范

**用法**：

```
/git-master commit these changes
/git-master rebase onto main
/git-master who wrote this authentication code?
```

#### frontend-ui-ux 设计流程

- **设计流程**：目的、基调、约束、差异化
- **美学方向**：选择极致风格：极简主义、极繁主义、复古未来主义、奢华、俏皮
- **排版**：独特的字体，避免使用通用字体（Inter、Roboto、Arial）
- **颜色**：具有鲜明点缀的凝聚力配色方案，避免白底紫字的 AI 俗套配色
- **动态效果**：高影响力的交错揭示、滚动触发、令人惊喜的悬停状态
- **反模式**：通用字体、可预测的布局、千篇一律的设计

### 浏览器自动化选项

Oh-My-OpenAgent 提供了两个浏览器自动化服务商，可通过 `browser_automation_engine.provider` 进行配置。

#### 选项 1：Playwright MCP（默认）

```yaml
mcp:
  playwright:
    command: npx
    args: ["@playwright/mcp@latest"]
```

**用法**：

```
/playwright Navigate to example.com and take a screenshot
```

#### 选项 2：Agent Browser CLI (Vercel)

```json
{
  "browser_automation_engine": {
    "provider": "agent-browser"
  }
}
```

**需要安装**：

```bash
bun add -g agent-browser
```

**用法**：

```
Use agent-browser to navigate to example.com and extract the main heading
```

**功能（两个服务商均支持）**：

- 导航并与网页交互
- 获取截图和 PDF
- 填写表单并点击元素
- 等待网络请求
- 抓取内容

### 自定义技能创建 (SKILL.md)

你可以直接将自定义技能添加到项目根目录的 `.opencode/skills/` 或主目录的 `~/.claude/skills/` 中。

**示例：`.opencode/skills/my-skill/SKILL.md`**

```markdown
---
name: my-skill
description: My special custom skill
mcp:
  my-mcp:
    command: npx
    args: ["-y", "my-mcp-server"]
---

# My Skill Prompt

This content will be injected into the agent's system prompt.
...
```

**技能加载位置**（优先级顺序，最高者优先）：

- `.opencode/skills/*/SKILL.md`（项目，OpenCode 原生）
- `~/.config/opencode/skills/*/SKILL.md`（用户，OpenCode 原生）
- `.claude/skills/*/SKILL.md`（项目，Claude Code 兼容）
- `.agents/skills/*/SKILL.md`（项目，Agents 规范）
- `~/.agents/skills/*/SKILL.md`（用户，Agents 规范）

高优先级的同名技能会覆盖低优先级的技能。

加载的技能显示优先级遵循以下顺序：`project > user > opencode > builtin/plugin`。

通过配置中的 `disabled_skills: ["playwright"]` 禁用内置技能。

### 类别 + 技能组合策略

你可以通过结合类别和技能来创建强大的专业智能体。

#### 设计师（UI 实现）

- **类别**：`visual-engineering`
- **load_skills**：`["frontend-ui-ux", "playwright"]`
- **效果**：实现美观的 UI 并直接在浏览器中验证渲染结果。

#### 架构师（设计审查）

- **类别**：`ultrabrain`
- **load_skills**：`[]`（纯推理）
- **效果**：利用 GPT-5.5 xhigh 推理进行深入的系统架构分析。

#### 维护者（快速修复）

- **类别**：`quick`
- **load_skills**：`["git-master"]`
- **效果**：使用高性价比的模型快速修复代码并生成干净的提交。

### task 提示词指南

在委派任务时，**清晰且具体**的提示词至关重要。包含以下 7 个要素：

1. **TASK**：需要做什么？（单一目标）
2. **EXPECTED OUTCOME**：交付物是什么？
3. **REQUIRED SKILLS**：应该通过 `load_skills` 加载哪些技能？
4. **REQUIRED TOOLS**：必须使用哪些工具？（白名单）
5. **MUST DO**：必须做什么（约束条件）
6. **MUST NOT DO**：绝对不能做什么
7. **CONTEXT**：文件路径、现有模式、参考材料

**坏示例**：

> "Fix this"

**好示例**：

> **TASK**: Fix mobile layout breaking issue in `LoginButton.tsx`
> **CONTEXT**: `src/components/LoginButton.tsx`, using Tailwind CSS
> **MUST DO**: Change flex-direction at `md:` breakpoint
> **MUST NOT DO**: Modify existing desktop layout
> **EXPECTED**: Buttons align vertically on mobile

## 命令

命令是斜杠触发的工作流，用于执行预定义的模板。

### 内置命令

| 命令 | 描述 |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `/init-deep` | 初始化分层 AGENTS.md 知识库 |
| `/ralph-loop` | 启动自引用开发循环，直到完成 |
| `/ulw-loop` | 启动超负荷工作循环：在超负荷工作模式下继续 |
| `/cancel-ralph` | 取消活跃的 Ralph 循环 |
| `/refactor` | 使用 LSP、AST-grep、架构分析和 TDD 验证进行智能重构 |
| `/start-work` | 从 Prometheus 规划启动 Sisyphus 工作会话 |
| `/stop-continuation` | 停止此会话的所有持续机制（ralph 循环、待办事项持续、boulder） |
| `/handoff` | 创建详细的上下文摘要，以便在新会话中继续工作 |

### /init-deep

**目的**：在整个项目中生成分层的 AGENTS.md 文件

**用法**：

```
/init-deep [--create-new] [--max-depth=N]
```

创建智能体会自动读取的目录特定上下文文件：

```
project/
├── AGENTS.md              # 项目级上下文
├── src/
│   ├── AGENTS.md          # src 特定上下文
│   └── components/
│       └── AGENTS.md      # 组件特定上下文
```

### /ralph-loop

**目的**：自引用开发循环，运行直至任务完成

**命名源自**：Anthropic 的 Ralph Wiggum 插件

**用法**：

```
/ralph-loop "Build a REST API with authentication"
/ralph-loop "Refactor the payment module" --max-iterations=50
```

**行为**：

- 智能体朝着目标持续工作
- 检测 `<promise>DONE</promise>` 以了解何时完成
- 如果智能体在未完成的情况下停止，则自动继续
- 结束条件：检测到完成、达到最大迭代次数（默认 100）或调用 `/cancel-ralph`

**配置**：`{ "ralph_loop": { "enabled": true, "default_max_iterations": 100 } }`

### /ulw-loop

**目的**：与 ralph-loop 相同，但处于超负荷工作模式激活状态

一切都以最大强度运行：并行智能体、后台任务、积极的探索。

### /refactor

**目的**：使用完整工具链进行智能重构

**用法**：

```
/refactor <target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]
```

**功能**：

- LSP 驱动的重命名和导航
- 用于模式匹配的 AST-grep
- 更改前的架构分析
- 更改后的 TDD 验证
- 代码图生成

### /start-work

**目的**：从 Prometheus 生成的规划开始执行

**用法**：

```
/start-work [plan-name]
```

使用 atlas 智能体系统地执行规划好的任务。

### /stop-continuation

**目的**：停止此会话的所有持续机制

停止 ralph 循环、待办事项持续和 boulder 状态。当你希望智能体停止其当前的多步骤工作流时使用。

### /handoff

**目的**：创建详细的上下文摘要，以便在新会话中继续工作

生成一份结构化的交接文档，记录当前状态、已完成的工作、剩余的工作以及相关的文件路径，从而在新会话中实现无缝衔接。

### 自定义命令

从以下位置加载自定义命令：

- `.opencode/command/*.md`（项目，OpenCode 原生）
- `~/.config/opencode/command/*.md`（用户，OpenCode 原生）
- `.claude/commands/*.md`（项目，Claude Code 兼容）
- `~/.config/opencode/commands/*.md`（用户，Claude Code 兼容）

## 工具

工具注册受配置控制。`src/tools/` 拥有 16 个目录，公开的工具范围从**最少 20 个到最多 39 个**。

### 代码搜索工具

| 工具 | 描述 |
| -------- | ----------------------------------------------------------------- |
| **grep** | 使用正则表达式进行内容搜索。按文件模式过滤。 |
| **glob** | 快速文件模式匹配。通过名称模式查找文件。 |

### 编辑工具

| 工具 | 描述 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **edit** | 锚定哈希的编辑工具。使用 `LINE#ID` 格式进行精确、安全的修改。在应用更改前验证内容哈希，并拒绝过期的哈希编辑。 |

哈希行 ID 使用来自 `ZPMQVRWSNKTXJBYH` 的字符。

### LSP 工具（智能体的 IDE 功能）

| 工具 | 描述 |
| ----------------------- | ------------------------------------------- |
| **lsp_diagnostics** | 在构建前获取错误/警告 |
| **lsp_prepare_rename** | 验证重命名操作 |
| **lsp_rename** | 在整个工作区中重命名符号 |
| **lsp_goto_definition** | 跳转到符号定义 |
| **lsp_find_references** | 在整个工作区中查找所有使用处 |
| **lsp_symbols** | 获取文件大纲或工作区符号搜索 |

### AST-Grep 工具

这些面向用户的工具名称由基于 `packages/ast-grep-mcp/` 的内置本地 `ast_grep` MCP 提供。

| 工具 | 描述 |
| -------------------- | -------------------------------------------- |
| **ast_grep_search** | 具有 AST 感知的代码模式搜索（支持 25 种语言） |
| **ast_grep_replace** | 具有 AST 感知的代码替换 |

### 委派工具

| 工具 | 描述 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **call_omo_agent** | 生成 explore/librarian 智能体。支持 `run_in_background`。 |
| **task** | 基于类别的任务委派。支持内置类别（如 `visual-engineering`、`ultrabrain`、`deep`、`artistry`、`quick`、`unspecified-low`、`unspecified-high` 和 `writing`），或通过 `subagent_type` 直接指定智能体。 |
| **background_output** | 检索后台任务结果 |
| **background_cancel** | 取消运行中的后台任务 |

### 视觉分析工具

| 工具 | 描述 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **look_at** | 通过 Multimodal-Looker 智能体分析媒体文件（PDF、图像、图表）。从文档中提取特定信息或摘要，描述视觉内容。 |

### 技能工具

| 工具 | 描述 |
| ------------- | ----------------------------------------------------------------                              |
| **skill** | 按名称加载并执行技能或斜杠命令。返回应用了上下文的详细说明。 |
| **skill_mcp** | 从技能嵌入式 MCP 调用 MCP 服务器操作。 |

### 会话工具

| 工具 | 描述 |
| ------------------ | ---------------------------------------- |
| **session_list** | 列出所有 OpenCode 会话 |
| **session_read** | 从会话中读取消息和历史记录 |
| **session_search** | 在会话消息中进行全文搜索 |
| **session_info** | 获取会话元数据和统计信息 |

### 任务管理工具

需要在配置中设置 `experimental.task_system: true`。

| 工具 | 描述 |
| --------------- | ---------------------------------------- |
| **task_create** | 创建一个带有自动生成 ID 的新任务 |
| **task_get** | 通过 ID 检索任务 |
| **task_list** | 列出所有活动任务 |
| **task_update** | 更新现有任务 |

#### 任务系统详细信息

**关于 Claude Code 对齐的说明**：此实现遵循 Claude Code 的内部任务工具签名（`TaskCreate`、`TaskUpdate`、`TaskList`、`TaskGet`）和字段命名规范（`subject`、`blockedBy`、`blocks` 等）。然而，Anthropic 尚未发布这些工具的官方文档。这是 Oh My OpenAgent 根据观察到的 Claude Code 行为和内部规范进行的自主实现。

**任务模式**：

```ts
interface Task {
  id: string; // T-{uuid}
  subject: string; // 祈使句："Run tests"
  description: string;
  status: "pending" | "in_progress" | "completed" | "deleted";
  activeForm?: string; // 现在进行时："Running tests"
  blocks: string[]; // 此任务拦截的任务
  blockedBy: string[]; // 拦截此任务的任务
  owner?: string; // 智能体名称
  metadata?: Record<string, unknown>;
  threadID: string; // 会话 ID（自动设置）
}
```

**依赖关系和并行执行**：

```
[Build Frontend]    ──┐
                      ├──→ [Integration Tests] ──→ [Deploy]
[Build Backend]     ──┘
```

- `blockedBy` 为空的任务并行运行
- 依赖任务会等待，直到拦截任务完成

**工作流示例**：

```ts
TaskCreate({ subject: "Build frontend" }); // T-001
TaskCreate({ subject: "Build backend" }); // T-002
TaskCreate({ subject: "Run integration tests", blockedBy: ["T-001", "T-002"] }); // T-003

TaskList();
// T-001 [pending] Build frontend        blockedBy: []
// T-002 [pending] Build backend         blockedBy: []
// T-003 [pending] Integration tests     blockedBy: [T-001, T-002]

TaskUpdate({ id: "T-001", status: "completed" });
TaskUpdate({ id: "T-002", status: "completed" });
// T-003 现在已解除拦截
```

**存储**：任务以 JSON 文件形式存储在 `.omo/tasks/` 中。

**与 TodoWrite 的区别**：

| 功能 | TodoWrite | 任务系统 |
| ------------------ | -------------- | -------------------------- |
| 存储 | 会话内存 | 文件系统 |
| 持久性 | 关闭时丢失 | 重启后依然存在 |
| 依赖关系 | 无 | 完全支持（`blockedBy`） |
| 并行执行 | 手动 | 自动优化 |

**何时使用**：当工作有多个带有依赖关系的步骤、多个子智能体将协同工作或进度应跨会话持久化时，请使用任务系统。

### 交互式终端工具

| 工具 | 描述 |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **interactive_bash** | 针对 TUI 应用（vim、htop、pudb）的基于 Tmux 的终端。直接传递 tmux 子命令，无需前缀。 |

**用法示例**：

```bash
# 创建一个新会话
interactive_bash(tmux_command="new-session -d -s dev-app")

# 向会话发送按键
interactive_bash(tmux_command="send-keys -t dev-app 'vim main.py' Enter")

# 捕获窗格输出
interactive_bash(tmux_command="capture-pane -p -t dev-app")
```

**关键点**：

- 命令是 tmux 子命令（无 `tmux` 前缀）
- 用于需要持久会话的交互式应用
- 单次执行的命令应使用带有 `&` 的常规 `Bash` 工具

## 钩子

钩子在整个会话、消息、工具和参数流水线的关键点拦截并修改智能体生命周期中的行为。

当前组合计数：

- 会话：24
- 工具守卫：16
- 转换器：5
- 持续机制：7
- 技能：2
- 基础总计：54
- 启用 `team_mode.enabled` 后：+1 工具守卫、+2 转换器、`src/plugin/event.ts` 中的 +4 直接团队会话事件处理器 = 61

### 钩子事件

| 事件 | 何时触发 | 可以做什么 |
| --------------- | ----------------------------- | -------------------------------------------------- |
| **PreToolUse** | 工具执行前 | 拦截、修改输入、注入上下文 |
| **PostToolUse** | 工具执行后 | 添加警告、修改输出、注入消息 |
| **Message** | 消息处理期间 | 转换内容、检测关键字、激活模式 |
| **Event** | 会话生命周期更改时 | 恢复、备用、通知 |
| **Transform** | 上下文转换期间 | 注入上下文、验证块 |
| **Params** | 设置 API 参数时 | 调整模型设置、投入水平 |

### 内置钩子

#### 上下文与注入

| 钩子 | 事件 | 描述 |
| ------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **directory-agents-injector** | PreToolUse + PostToolUse | 读取文件时自动注入 AGENTS.md。从文件所在目录向上遍历至项目根目录，收集所有 AGENTS.md 文件。在 OpenCode 1.1.37+ 中已弃用，当原生 AGENTS.md 注入可用时会自动禁用。 |
| **directory-readme-injector** | PreToolUse + PostToolUse | 自动注入 README.md 以提供目录上下文。 |
| **rules-injector** | PreToolUse + PostToolUse | 当条件匹配时，从 `.claude/rules/` 注入规则。支持 glob 和 alwaysApply。 |
| **compaction-context-injector** | Event | 在会话压缩期间保留关键上下文。 |
| **context-window-monitor** | Event | 监控上下文窗口使用情况并跟踪 token 消耗。 |
| **preemptive-compaction** | Event | 在达到 token 限制前主动压缩会话。 |

#### 生产力与控制

| 钩子 | 事件 | 描述 |
| --------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **keyword-detector** | Message + Transform | IntentGate 检测器。从消息关键字中激活 `ultrawork`/`ulw`、`search`、`analyze` 和 `team` 模式。 |
| **think-mode** | Params | 自动检测扩展思考需求。捕获 "think deeply"、"ultrathink" 并调整模型设置。 |
| **ralph-loop** | Event + Message | 管理自引用循环的持续。 |
| **start-work** | Message | 处理 /start-work 命令的执行。 |
| **auto-slash-command** | Message | 从提示词中自动执行斜杠命令。 |
| **stop-continuation-guard** | Event + Message | 守卫停止持续机制。 |
| **category-skill-reminder** | Event + PostToolUse | 提醒智能体可用于委派的类别技能。 |
| **anthropic-effort** | Params | 根据上下文调整 Anthropic API 的投入水平。 |

#### 质量与安全

| 钩子 | 事件 | 描述 |
| ------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| **comment-checker** | PostToolUse | 运行 `@code-yeongyu/comment-checker` 以拦截 AI 俗套注释模式。绕过选项：单行使用 `// @allow`，文件顶部使用 `// comment-checker-disable-file`。 |
| **thinking-block-validator** | Transform | 验证思考块以防止 API 错误。 |
| **edit-error-recovery** | PostToolUse + Event | 从编辑工具失败中恢复。 |
| **write-existing-file-guard** | PreToolUse | 防止在未先读取现有文件的情况下意外覆盖它们。 |
| **hashline-read-enhancer** | PostToolUse | 使用针对 hashline 编辑工具的锚定哈希行标记来增强读取输出。 |

#### 恢复与稳定性

| 钩子 | 事件 | 描述 |
| ------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **session-recovery** | Event | 从会话错误中恢复：缺失工具结果、思考块问题、空消息。 |
| **anthropic-context-window-limit-recovery** | Event | 优雅地处理 Claude 上下文窗口限制。 |
| **runtime-fallback** | Event + Message | 在发生可重试的 API 错误（例如 429、500、502、503、504）、服务商密钥配置错误（例如缺失 API 密钥）以及服务商重试信号时，自动切换到备用模型。检测 `message.updated` 重试信号需要 `timeout_seconds > 0`；结构化的 `session.status` 重试事件仍可触发备用。 |
| **model-fallback** | Event + Message | 当主模型不可用时管理模型备用链。 |
| **json-error-recovery** | PostToolUse | 从工具输出中的 JSON 解析错误中恢复。 |

#### 截断与上下文管理

| 钩子 | 事件 | 描述 |
| ------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| **tool-output-truncator** | PostToolUse | 截断来自 Grep、Glob、LSP、AST-grep 工具的输出。根据上下文窗口进行动态调整。 |

#### 通知与体验

| 钩子 | 事件 | 描述 |
| ---------------------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| **auto-update-checker** | Event | 在创建会话时检查新版本，显示带有版本和 Sisyphus 状态的启动提示。 |
| **background-notification** | Event | 在后台智能体任务完成时发出通知。 |
| **session-notification** | Event | 当智能体进入空闲状态时发送系统通知。适用于 macOS、Linux、Windows。 |
| **agent-usage-reminder** | PostToolUse + Event | 提醒你利用专业智能体以获得更好的结果。 |
| **question-label-truncator** | PreToolUse | 截断 Question 工具 UI 中过长的提问标签。 |

#### 任务管理

| 钩子 | 事件 | 描述 |
| -------------------------------- | ------------------- | --------------------------------------------------- |
| **task-resume-info** | PostToolUse | 为持续性提供任务恢复信息。 |
| **delegate-task-retry** | PostToolUse + Event | 重试失败的任务委派调用。 |
| **empty-task-response-detector** | PostToolUse | 检测委派任务的空响应。 |
| **tasks-todowrite-disabler** | PreToolUse | 当任务系统处于活动状态时禁用 TodoWrite 工具。 |

#### 持续机制

| 钩子 | 事件 | 描述 |
| ------------------------------ | ----- | ---------------------------------------------------------- |
| **todo-continuation-enforcer** | Event | 强制完成待办事项：将空闲的智能体拉回工作状态。 |
| **compaction-todo-preserver** | Event | 在会话压缩期间保留待办事项状态。 |
| **unstable-agent-babysitter** | Event | 使用恢复策略处理不稳定的智能体行为。 |

#### 集成

| 钩子 | 事件 | 描述 |
| ---------------------------- | ------------------- | ------------------------------------------------------- |
| **claude-code-hooks** | All | 执行来自 Claude Code 的 settings.json 的钩子。 |
| **atlas** | Multiple | 待办事项驱动型工作会话的核心编排逻辑。 |
| **interactive-bash-session** | PostToolUse + Event | 管理用于交互式 CLI 的 tmux 会话。 |
| **non-interactive-env** | PreToolUse | 处理非交互式环境约束。 |

#### 专用

| 钩子 | 事件 | 描述 |
| --------------------------- | ---------- | ---------------------------------------------------------- |
| **prometheus-md-only** | PreToolUse | 强制 Prometheus 规划器仅输出 markdown。 |
| **no-sisyphus-gpt** | Message | 防止 Sisyphus 在不兼容的 GPT 模型上运行。 |
| **no-hephaestus-non-gpt** | Message | 防止 Hephaestus 在非 GPT 模型上运行。 |
| **sisyphus-junior-notepad** | PreToolUse | 为 Sisyphus-Junior 智能体管理记事本状态。 |

### Claude Code 钩子集成

通过 Claude Code 的 `settings.json` 运行自定义脚本：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "eslint --fix $FILE" }]
      }
    ]
  }
}
```

**钩子位置**：

- `~/.claude/settings.json`（用户）
- `./.claude/settings.json`（项目）
- `./.claude/settings.local.json`（本地，已加入 git 忽略）

### 禁用钩子

在配置中禁用特定钩子：

```json
{
  "disabled_hooks": ["comment-checker"]
}
```

## MCP

该插件使用三级 MCP 架构：

1. 来自 `src/mcp/` 的内置 MCP（远程加本地 stdio）
2. 带有 `${VAR}` 展开的 Claude Code `.mcp.json` 加载器
3. 在 `SKILL.md` 前言中声明的技能嵌入式 MCP 服务器

### 原生与插件注入的 MCP

oh-my-openagent 通过 OpenCode 插件 API 在**运行时**注入 MCP 服务器。这与你直接在 `opencode.json` 中配置的 MCP 服务器有本质区别。

因为 `opencode mcp list` 仅读取 OpenCode 的静态配置，所以它**无法看到**插件在运行时注入的 MCP。这是预期行为，并非 Bug：

```
# 这些是插件注入的 — 它们不会出现在这里
$ opencode mcp list
No MCP servers configured
```

要检查 oh-my-openagent 实际提供了哪些 MCP 服务器，请运行 doctor 命令：

```bash
bunx oh-my-openagent doctor --verbose
```

三级 MCP 服务器及其来源：

| 级别 | 来源 | 在 `opencode mcp list` 中可见吗？ |
| ---- | ------ | ------------------------------- |
| 1 — 内置 | 由 oh-my-openagent 在运行时注入（`websearch`、`context7`、`grep_app`） | 否 |
| 2 — Claude Code `.mcp.json` | 从 `.mcp.json` 文件加载，并由 oh-my-openagent 在运行时合并 | 否 |
| 3 — 技能嵌入 | 在 `SKILL.md` 前言中声明，每个会话按需启动 | 否 |
| — 原生 OpenCode | 直接在 `opencode.json` 的 `mcp` 键下配置，无需插件 | 是 |

**禁用内置 MCP**：在插件配置中使用 `disabled_mcps`：

```jsonc
{
  "disabled_mcps": ["websearch", "grep_app"]
}
```

### 内置 MCP

| MCP | 描述 |
| ------------- | --------------------------------------------------------------------------------------------- |
| **websearch** | 由 Exa AI 提供支持的实时网页搜索 |
| **context7** | 针对任何库/框架的官方文档查询 |
| **grep_app** | 在公共 GitHub 仓库中进行极速代码搜索。非常适合寻找实现示例。 |
| **lsp** | 用于诊断、符号、引用和重命名的本地 LSP 工具 |
| **ast_grep** | 本地 AST 感知搜索和重写工具 |

### 技能嵌入式 MCP

技能可以携带自己的 MCP 服务器：

```yaml
---
description: Browser automation skill
mcp:
  playwright:
    command: npx
    args: ["-y", "@anthropic-ai/mcp-playwright"]
---
```

`skill_mcp` 工具通过完整的模式发现来调用这些操作。

技能 MCP 客户端在每个会话中通过键 `${sessionID}:${skillName}:${serverName}` 进行隔离。

#### 启用 OAuth 的 MCP

技能可以定义受 OAuth 保护的远程 MCP 服务器。支持完全符合 RFC 规范（RFC 9728、8414、8707、7591）的 OAuth 2.1：

```yaml
---
description: My API skill
mcp:
  my-api:
    url: https://api.example.com/mcp
    oauth:
      clientId: ${CLIENT_ID}
      scopes: ["read", "write"]
---
```

当技能 MCP 配置了 `oauth` 时：

- **自动发现**：获取 `/.well-known/oauth-protected-resource` (RFC 9728)，备用方案为 `/.well-known/oauth-authorization-server` (RFC 8414)
- **动态客户端注册**：在支持 RFC 7591 的服务器上自动注册（clientId 变为可选）
- **PKCE**：对所有流程强制执行
- **资源指示器**：根据 RFC 8707 从 MCP URL 自动生成
- **Token 存储**：持久化在 `~/.config/opencode/mcp-oauth.json` 中（权限为 0600）
- **自动刷新**：Token 在 401 时刷新；在 403 且带有 `WWW-Authenticate` 时进行升级授权
- **动态端口**：OAuth 回调服务器使用自动发现的可用端口

通过 CLI 进行预认证：

```bash
bunx oh-my-opencode mcp oauth login <server-name> --server-url https://api.example.com
```

## 模型能力

模型能力由 models.dev 支持，具有可刷新的缓存和兼容性诊断。系统结合了捆绑的 models.dev 快照数据、可选的已刷新缓存数据、服务商运行时元数据，以及在确切元数据不可用时的启发式方法。

### 刷新能力

使用最新的模型信息更新本地缓存：

```bash
bunx oh-my-opencode refresh-model-capabilities
```

配置启动时自动刷新：

```jsonc
{
  "model_capabilities": {
    "enabled": true,
    "auto_refresh_on_start": true,
    "refresh_timeout_ms": 5000,
    "source_url": "https://models.dev/api.json"
  }
}
```

### 能力诊断

运行 `bunx oh-my-opencode doctor` 以查看能力诊断，包括：
- 针对智能体和类别的有效模型解析
- 当配置的模型依赖于兼容性备用时的警告
- 伴随模型解析输出的覆盖兼容性详细信息

## 上下文注入

### 目录 AGENTS.md

读取文件时自动注入 AGENTS.md。从文件所在目录向上遍历至项目根目录：

```
project/
├── AGENTS.md              # 首先注入
├── src/
│   ├── AGENTS.md          # 其次注入
│   └── components/
│       ├── AGENTS.md      # 最后注入
│       └── Button.tsx     # 读取此文件会注入上述所有 3 个文件
```

### 条件规则

当条件匹配时，从 `.claude/rules/` 注入规则：

```markdown
---
globs: ["*.ts", "src/**/*.js"]
description: "TypeScript/JavaScript coding rules"
---

- Use PascalCase for interface names
- Use camelCase for function names
```

支持：

- `.md` 和 `.mdc` 文件
- 用于模式匹配的 `globs` 字段
- 用于无条件规则的 `alwaysApply: true`
- 从文件向上遍历至项目根目录，以及 `~/.claude/rules/`

## Claude Code 兼容性

针对 Claude Code 配置的完整兼容层。

### 配置加载器

| 类型 | 位置 |
| ------------ | ---------------------------------------------------------------------------------- |
| **命令** | `~/.config/opencode/commands/`、`.claude/commands/` |
| **技能** | `~/.config/opencode/skills/*/SKILL.md`、`.claude/skills/*/SKILL.md` |
| **智能体** | `~/.config/opencode/agents/*.md`、`.claude/agents/*.md` |
| **MCP** | `~/.claude.json`、`~/.config/opencode/.mcp.json`、`.mcp.json`、`.claude/.mcp.json` |

MCP 配置支持环境变量展开：`${VAR}`。

### 兼容性开关

禁用特定功能：

```json
{
  "claude_code": {
    "mcp": false,
    "commands": false,
    "skills": false,
    "agents": false,
    "hooks": false,
    "plugins": false
  }
}
```

| 开关 | 禁用内容 |
| ---------- | ------------------------------------------------------------ |
| `mcp` | `.mcp.json` 文件（保留内置 MCP） |
| `commands` | 从 Claude Code 路径加载命令 |
| `skills` | 从 Claude Code 路径加载技能 |
| `agents` | 从 Claude Code 路径加载智能体（保留内置智能体） |
| `hooks` | settings.json 钩子 |
| `plugins` | Claude Code 插件市场的插件 |

禁用特定插件：

```json
{
  "claude_code": {
    "plugins_override": {
      "claude-mem@thedotmack": false
    }
  }
}
```
