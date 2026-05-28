# 配置参考

Oh My OpenCode 插件配置的完整参考。在重命名过渡期间，运行时能够识别 `oh-my-openagent.json[c]` 和旧版的 `oh-my-opencode.json[c]` 文件。

---

## 目录

- [快速入门](#快速入门)
  - [文件位置](#文件位置)
  - [快速入门示例](#快速入门示例)
- [核心概念](#核心概念)
  - [智能体](#智能体)
  - [类别](#类别)
  - [模型解析](#模型解析)
- [任务系统](#任务系统)
  - [后台任务](#后台任务)
  - [Sisyphus 智能体](#sisyphus-智能体)
  - [Sisyphus 任务](#sisyphus-任务)
- [功能特性](#功能特性)
  - [技能](#技能)
  - [钩子](#钩子)
  - [命令](#命令)
  - [浏览器自动化](#浏览器自动化)
  - [Tmux 集成](#tmux-集成)
  - [Git Master](#git-master)
  - [注释检查器](#注释检查器)
  - [通知](#通知)
  - [MCP](#mcp)
  - [LSP](#lsp)
- [高级配置](#高级配置)
  - [运行时降级](#运行时降级)
  - [模型能力](#模型能力)
  - [Hashline 编辑](#hashline-编辑)
  - [实验性功能](#实验性功能)
- [参考信息](#参考信息)
  - [环境变量](#环境变量)
  - [特定服务商](#特定服务商)

---

## 快速入门

### 文件位置

用户配置最先加载。项目配置通过从当前工作目录向上遍历到 `$HOME` 来发现；越近的配置优先级越高。如果工作目录在 `$HOME` 之外，则仅检查该目录。

1. 遍历发现的配置：`.opencode/oh-my-openagent.json[c]` 或旧版的 `.opencode/oh-my-opencode.json[c]`
2. 用户配置（首选 `.jsonc` 而非 `.json`）：

| 平台 | 候选路径 |
| ----------- | --------------- |
| macOS/Linux | `~/.config/opencode/oh-my-openagent.json[c]`, `~/.config/opencode/oh-my-opencode.json[c]` |
| Windows     | `%APPDATA%\opencode\oh-my-openagent.json[c]`, `%APPDATA%\opencode\oh-my-opencode.json[c]` |

**安全提示：** `mcp_env_allowlist` 仅限用户配置。遍历发现的项目配置无法对其进行扩展。

**重命名兼容性：** 已发布的 npm 包和 CLI 二进制文件仍命名为 `oh-my-opencode`。OpenCode 插件注册首选 `oh-my-openagent`，而在过渡期间，旧版的 `oh-my-opencode` 条目和配置基准名称仍会加载。配置检测会先检查 `oh-my-opencode`，然后再检查 `oh-my-openagent`，因此如果同一个目录中同时存在这两个插件配置基准名称，旧版的 `oh-my-opencode.*` 文件目前会胜出。
JSONC 支持 `// 单行注释`、`/* 块注释 */` 以及尾随逗号。

启用 Schema 自动补全：

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json"
}
```

运行 `bunx oh-my-opencode install` 进行引导式设置。运行 `opencode models` 列出可用模型。

### 快速入门示例

这是一个实用的初始配置：

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json",

  "agents": {
    // 主编排器：Claude Opus 或 Kimi K2.6 效果最好
    "sisyphus": {
      "model": "kimi-for-coding/k2p5",
      "ultrawork": { "model": "anthropic/claude-opus-4-7", "variant": "max" },
    },

    // 研究智能体：便宜且快速的模型即可
    "librarian": { "model": "google/gemini-3-flash" },
    "explore": { "model": "github-copilot/grok-code-fast-1" },

    // 架构咨询：GPT-5.5 或 Claude Opus
    "oracle": { "model": "openai/gpt-5.5", "variant": "high" },

    // Prometheus 继承 sisyphus 模型；只需添加提示词引导
    "prometheus": {
      "prompt_append": "Leverage deep & quick agents heavily, always in parallel.",
    },
  },

  "categories": {
    // quick - 琐碎任务
    "quick": { "model": "opencode/gpt-5-nano" },

    // unspecified-low - 中等任务
    "unspecified-low": { "model": "anthropic/claude-sonnet-4-6" },

    // unspecified-high - 复杂工作
    "unspecified-high": { "model": "anthropic/claude-opus-4-7", "variant": "max" },

    // writing - 文档/散文
    "writing": { "model": "kimi-for-coding/k2p5" },

    // visual-engineering - Gemini 在视觉任务中占主导地位
    "visual-engineering": {
      "model": "google/gemini-3.1-pro",
      "variant": "high",
    },

    // 用于 git 操作的自定义类别
    "git": {
      "model": "opencode/gpt-5-nano",
      "description": "All git operations",
      "prompt_append": "Focus on atomic commits, clear messages, and safe operations.",
    },
  },

  // 限制昂贵的服务商；让便宜的服务商自由运行
  "background_task": {
    "providerConcurrency": {
      "anthropic": 3,
      "openai": 3,
      "opencode": 10,
      "zai-coding-plan": 10,
    },
    "modelConcurrency": {
      "anthropic/claude-opus-4-7": 2,
      "opencode/gpt-5-nano": 20,
    },
  },

  "experimental": { "aggressive_truncation": true, "task_system": true },
  "tmux": { "enabled": false },
}
```

---

## 核心概念

### 智能体

覆盖内置智能体设置。可用的智能体有：`sisyphus`、`hephaestus`、`prometheus`、`oracle`、`librarian`、`explore`、`multimodal-looker`、`metis`、`momus`、`atlas`、`sisyphus-junior`。

```json
{
  "agents": {
    "explore": { "model": "anthropic/claude-haiku-4-5", "temperature": 0.5 },
    "multimodal-looker": { "disable": true }
  }
}
```

完全禁用智能体：`{ "disabled_agents": ["oracle", "multimodal-looker"] }`

智能体标签页循环默认顺序为 Sisyphus、Hephaestus、Prometheus、Atlas。使用 `agent_order` 可以覆盖已知的智能体顺序；省略的核心智能体将保持其默认的相对顺序。未知或重复的名称将被忽略，并通过配置提示（toast）进行报告。

```json
{
  "agent_order": ["hephaestus", "sisyphus", "prometheus", "atlas"]
}
```

#### 智能体选项

| 选项 | 类型 | 描述 |
| ----------------- | -------------- | --------------------------------------------------------------- |
| `model`           | string         | 模型覆盖 (`provider/model`)                               |
| `fallback_models` | string\|array  | API 错误时的降级模型。支持字符串，或者包含字符串和具有单模型设置的对象条目的混合数组 |
| `temperature`     | number         | 采样温度                                            |
| `top_p`           | number         | Top-p 采样                                                  |
| `prompt`          | string         | 替换系统提示词。支持 `file://` URI                  |
| `prompt_append`   | string         | 追加到系统提示词。支持 `file://` URI                |
| `tools`           | array         | 允许的工具列表                                     |
| `disable`         | boolean       | 禁用此智能体                                     |
| `mode`            | string        | 智能体模式                                             |
| `color`           | string        | UI 颜色                                               |
| `permission`      | object        | 单工具权限（见下文）                       |
| `category`        | string        | 从类别继承模型                            |
| `variant`         | string        | 模型变体：`max`、`high`、`medium`、`low`、`xhigh`。会归一化为支持的值 |
| `maxTokens`       | number        | 最大响应 token 数                                    |
| `thinking`        | object        | Anthropic 扩展思考 (extended thinking)                            |
| `reasoningEffort` | string        | OpenAI 推理能力：`none`、`minimal`、`low`、`medium`、`high`、`xhigh`。会归一化为支持的值 |
| `textVerbosity`   | string        | 文本详细度：`low`、`medium`、`high`                |
| `providerOptions` | object        | 特定服务商的选项                              |

#### Anthropic 扩展思考

```json
{
  "agents": {
    "oracle": { "thinking": { "type": "enabled", "budgetTokens": 200000 } }
  }
}
```

#### 智能体权限

控制智能体可以使用哪些工具：

```json
{
  "agents": {
    "explore": {
      "permission": {
        "edit": "deny",
        "bash": "ask",
        "webfetch": "allow"
      }
    }
  }
}
```

| 权限 | 取值 |
| -------------------- | --------------------------------------------------------------------------- |
| `edit`               | `ask` / `allow` / `deny`                                                    |
| `bash`               | `ask` / `allow` / `deny` 或针对特定命令：`{ "git": "allow", "rm": "deny" }` |
| `webfetch`           | `ask` / `allow` / `deny`                                                    |
| `doom_loop`          | `ask` / `allow` / `deny`                                                    |
| `external_directory` | `ask` / `allow` / `deny`                                                    |

#### 具有单模型设置的降级模型

`fallback_models` 接受单个模型字符串或数组。数组条目可以是普通字符串，也可以是包含单个模型设置的对象：

```jsonc
{
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-opus-4-7",
      "fallback_models": [
        // 简单的字符串降级
        "openai/gpt-5.5",
        // 包含单模型设置的对象
        {
          "model": "google/gemini-3.1-pro",
          "variant": "high",
          "temperature": 0.2
        },
        {
          "model": "anthropic/claude-sonnet-4-6",
          "thinking": { "type": "enabled", "budgetTokens": 64000 }
        }
      ]
    }
  }
}
```

对象条目支持：`model`、`variant`、`reasoningEffort`、`temperature`、`top_p`、`maxTokens`、`thinking`。

#### 提示词的文件 URI

`prompt` 和 `prompt_append` 都支持通过 `file://` URI 从文件中加载内容。类别级别的 `prompt_append` 也支持相同的 URI 形式。

```jsonc
{
  "agents": {
    "sisyphus": {
      "prompt_append": "file:///absolute/path/to/prompt.txt"
    },
    "oracle": {
      "prompt": "file://./relative/to/project/prompt.md"
    },
    "explore": {
      "prompt_append": "file://~/home/dir/prompt.txt"
    }
  },
  "categories": {
    "custom": {
      "model": "anthropic/claude-sonnet-4-6",
      "prompt_append": "file://./category-context.md"
    }
  }
}
```

路径可以是绝对路径 (`file:///abs/path`)、相对于项目根目录的路径 (`file://./rel/path`) 或相对于用户主目录的路径 (`file://~/home/path`)。如果无法解码、解析或读取文件 URI，OmO 会在提示词中插入警告占位符，而不是直接报错失败。

### 类别

`task()` 工具使用的特定领域模型委派。当 Sisyphus 委派工作时，它选择的是一个类别，而不是具体的模型名称。

#### 内置类别

| 类别 | 默认模型 | 描述 |
| -------------------- | ------------------------------- | ---------------------------------------------- |
| `visual-engineering` | `google/gemini-3.1-pro` (high)  | 前端、UI/UX、设计、动画 |
| `ultrabrain`         | `openai/gpt-5.5` (xhigh)        | 深度逻辑推理、复杂架构 |
| `deep`               | `openai/gpt-5.5` (medium)       | 自主问题解决、详尽研究 |
| `artistry`           | `google/gemini-3.1-pro` (high)  | 创造性/非传统方法 |
| `quick`              | `openai/gpt-5.4-mini`           | 琐碎任务、拼写错误修复、单文件更改 |
| `unspecified-low`    | `anthropic/claude-sonnet-4-6`   | 通用任务、低工作量 |
| `unspecified-high`   | `anthropic/claude-opus-4-7` (max) | 通用任务、高工作量 |
| `writing`            | `kimi-for-coding/k2p5`          | 文档、散文、技术写作 |

> **注意**：内置类别的默认值是自动可用的。用户定义的类别配置会与内置默认值合并，或添加自定义类别。

#### 类别选项

| 选项 | 类型 | 默认值 | 描述 |
| ------------------- | ------------- | ------- | ------------------------------------------------------------------- |
| `model`             | string        | -       | 模型覆盖 |
| `fallback_models`   | string\|array | -       | API 错误时的降级模型。支持字符串，或者包含字符串和具有单模型设置的对象条目的混合数组 |
| `temperature`       | number        | -       | 采样温度 |
| `top_p`             | number        | -       | Top-p 采样 |
| `maxTokens`         | number        | -       | 最大响应 token 数 |
| `thinking`          | object        | -       | Anthropic 扩展思考 |
| `reasoningEffort`   | string        | -       | OpenAI 推理能力。不支持的值会被归一化 |
| `textVerbosity`     | string        | -       | 文本详细度 |
| `tools`             | object        | -       | 工具使用控制（使用 `{ "tool_name": false }` 禁用） |
| `prompt_append`     | string        | -       | 追加到系统提示词 |
| `max_prompt_tokens` | number        | -       | 委派任务的最大提示词 token 数 |
| `variant`           | string        | -       | 模型变体。不支持的值会被归一化 |
| `description`       | string        | -       | 显示在 `task()` 工具提示词中 |
| `is_unstable_agent` | boolean       | `false` | 强制后台模式 + 监控。对 Gemini 模型自动启用。 |
| `disable`           | boolean       | `false` | 从任务委派中排除此类别 |

禁用类别：`{ "categories": { "ultrabrain": { "disable": true } } }`

### 模型解析

运行时优先级：

1. **UI 选择的模型** - 在 OpenCode UI 中为主要智能体选择的模型
2. **用户覆盖** - 在配置中设置的模型 -> 完全按原样使用。即使在冷缓存中，显式的用户配置也优先于硬编码的降级链
3. **类别默认值** - 从分配 the 类别配置中继承的模型
4. **用户 `fallback_models`** - 在尝试内置降级链之前，先尝试用户配置的降级列表
5. **服务商降级链** - 来自 OmO 源码的内置服务商/模型链
6. **系统默认值** - OpenCode 配置的默认模型

#### 模型设置兼容性

模型设置会根据模型能力进行兼容性归一化，而不是直接报错失败。

归一化字段：

- `variant` - 降级到最接近的支持值
- `reasoningEffort` - 降级到最接近的支持值，如果不支持则移除
- `temperature` - 如果模型元数据不支持则移除
- `top_p` - 如果模型元数据不支持则移除
- `maxTokens` - 限制在模型报告的最大输出限制内
- `thinking` - 如果目标模型不支持思考则移除

示例：
- Claude 模型不支持 `reasoningEffort` - 会被自动移除
- GPT-4.1 不支持推理 - `reasoningEffort` 会被移除
- o 系列模型支持 `none` 到 `high` - `xhigh` 会被降级为 `high`
- GPT-5 支持 `none`、`minimal`、`low`、`medium`、`high`、`xhigh` - 全部直接通过

能力数据首先来自服务商运行时元数据。OmO 还附带了捆绑的基于 models.dev 的能力数据，支持可刷新的本地 models.dev 缓存，并在精确元数据不可用时降级为启发式系列检测加别名规则。`bunx oh-my-opencode doctor` 会显示能力诊断，并在配置的模型依赖兼容性降级时发出警告。

#### 智能体服务商链

| 智能体 | 默认模型 | 服务商优先级 |
| --------------------- | ------------------- | ---------------------------------------------------------------------------- |
| **Sisyphus**          | `claude-opus-4-7`   | `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `opencode-go/kimi-k2.6` → `kimi-for-coding/k2p5` → `opencode\|moonshotai\|moonshotai-cn\|firmware\|ollama-cloud\|aihubmix/kimi-k2.5` → `openai\|github-copilot\|opencode/gpt-5.5 (medium)` → `zai-coding-plan\|opencode/glm-5` → `opencode/big-pickle` |
| **Hephaestus**        | `gpt-5.5`           | `gpt-5.5 (medium)`                                                           |
| **oracle**            | `gpt-5.5`           | `openai\|github-copilot\|opencode/gpt-5.5 (high)` → `google\|github-copilot\|opencode/gemini-3.1-pro (high)` → `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `opencode-go/glm-5.1` |
| **librarian**         | `gpt-5.4-mini-fast` | `openai/gpt-5.4-mini-fast` → `opencode-go/qwen3.5-plus` → `vercel/minimax-m2.7-highspeed` → `opencode-go\|vercel/minimax-m2.7` → `anthropic\|opencode\|vercel/claude-haiku-4-5` → `openai\|opencode\|vercel/gpt-5.4-nano` |
| **explore**           | `gpt-5.4-mini-fast` | `openai/gpt-5.4-mini-fast` → `opencode-go/qwen3.5-plus` → `vercel/minimax-m2.7-highspeed` → `opencode-go\|vercel/minimax-m2.7` → `anthropic\|opencode\|vercel/claude-haiku-4-5` → `openai\|opencode\|vercel/gpt-5.4-nano` |
| **multimodal-looker** | `gpt-5.5`           | `openai\|opencode/gpt-5.5 (medium)` → `opencode-go/kimi-k2.6` → `zai-coding-plan/glm-4.6v` → `openai\|github-copilot\|opencode/gpt-5-nano` |
| **Prometheus**        | `claude-opus-4-7`   | `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `openai\|github-copilot\|opencode/gpt-5.5 (high)` → `opencode-go/glm-5.1` → `google\|github-copilot\|opencode/gemini-3.1-pro` |
| **Metis**             | `claude-sonnet-4-6` | `anthropic\|github-copilot\|opencode/claude-sonnet-4-6` → `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `openai\|github-copilot\|opencode/gpt-5.5 (high)` → `opencode-go/glm-5.1` → `kimi-for-coding/k2p5` |
| **Momus**             | `gpt-5.5`           | `openai\|github-copilot\|opencode/gpt-5.5 (xhigh)` → `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `google\|github-copilot\|opencode/gemini-3.1-pro (high)` → `opencode-go/glm-5.1` |
| **Atlas**             | `claude-sonnet-4-6` | `anthropic\|github-copilot\|opencode/claude-sonnet-4-6` → `opencode-go/kimi-k2.6` → `openai\|github-copilot\|opencode/gpt-5.5 (medium)` → `opencode-go/minimax-m2.7` |

#### 类别服务商链

此表记录了每个硬编码服务商降级链的第一项，而不是上面显示的内置类别默认值。例如，`writing` 默认使用 `kimi-for-coding/k2p5`，而其服务商降级链从 Gemini 开始。

| 类别 | 服务商链首选 | 服务商优先级 |
| ---------------------- | ------------------- | -------------------------------------------------------------- |
| **visual-engineering** | `gemini-3.1-pro`    | `google\|github-copilot\|opencode/gemini-3.1-pro (high)` → `zai-coding-plan\|opencode/glm-5` → `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `opencode-go/glm-5.1` → `kimi-for-coding/k2p5` |
| **ultrabrain**         | `gpt-5.5`           | `openai\|opencode/gpt-5.5 (xhigh)` → `google\|github-copilot\|opencode/gemini-3.1-pro (high)` → `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `opencode-go/glm-5.1` |
| **deep**               | `gpt-5.5`           | `openai\|github-copilot\|venice\|opencode/gpt-5.5 (medium)` → `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `google\|github-copilot\|opencode/gemini-3.1-pro (high)` |
| **artistry**           | `gemini-3.1-pro`    | `google\|github-copilot\|opencode/gemini-3.1-pro (high)` → `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `openai\|github-copilot\|opencode/gpt-5.5` |
| **quick**              | `gpt-5.4-mini`      | `openai\|github-copilot\|opencode/gpt-5.4-mini` → `anthropic\|github-copilot\|opencode/claude-haiku-4-5` → `google\|github-copilot\|opencode/gemini-3-flash` → `opencode-go/minimax-m2.7` → `opencode/gpt-5-nano` |
| **unspecified-low**    | `claude-sonnet-4-6` | `anthropic\|github-copilot\|opencode/claude-sonnet-4-6` → `openai\|opencode/gpt-5.3-codex (medium)` → `opencode-go/kimi-k2.6` → `google\|github-copilot\|opencode/gemini-3-flash` → `opencode-go/minimax-m2.7` |
| **unspecified-high**   | `claude-opus-4-7`   | `anthropic\|github-copilot\|opencode/claude-opus-4-7 (max)` → `openai\|github-copilot\|opencode/gpt-5.5 (high)` → `zai-coding-plan\|opencode/glm-5` → `kimi-for-coding/k2p5` → `opencode-go/glm-5.1` → `opencode/kimi-k2.5` → `opencode\|moonshotai\|moonshotai-cn\|firmware\|ollama-cloud\|aihubmix/kimi-k2.5` |
| **writing**            | `gemini-3-flash`    | `google\|github-copilot\|opencode/gemini-3-flash` → `opencode-go/kimi-k2.6` → `anthropic\|github-copilot\|opencode/claude-sonnet-4-6` → `opencode-go/minimax-m2.7` |

运行 `bunx oh-my-opencode doctor --verbose` 查看你配置的实际模型解析情况。

---

## 任务系统

### 后台任务

控制并行智能体执行和并发限制。

```json
{
  "background_task": {
    "defaultConcurrency": 5,
    "staleTimeoutMs": 180000,
    "providerConcurrency": { "anthropic": 3, "openai": 5, "google": 10 },
    "modelConcurrency": { "anthropic/claude-opus-4-7": 2 }
  }
}
```

| 选项 | 默认值 | 描述 |
| --------------------- | -------- | --------------------------------------------------------------------- |
| `defaultConcurrency`  | -        | 最大并发任务数（所有服务商） |
| `staleTimeoutMs`      | `180000` | 中断无活动的任务（最小值：60000） |
| `providerConcurrency` | -        | 每个服务商的限制（键 = 服务商名称） |
| `modelConcurrency`    | -        | 每个模型的限制（键 = `provider/model`）。覆盖服务商限制。 |

优先级：`modelConcurrency` > `providerConcurrency` > `defaultConcurrency`

### Sisyphus 智能体

配置主编排系统。

```json
{
  "sisyphus_agent": {
    "disabled": false,
    "default_builder_enabled": false,
    "planner_enabled": true,
    "replace_plan": true
  }
}
```

| 选项 | 默认值 | 描述 |
| ------------------------- | ------- | --------------------------------------------------------------- |
| `disabled`                | `false` | 禁用所有 Sisyphus 编排，恢复原始的构建/计划 |
| `default_builder_enabled` | `false` | 启用 OpenCode-Builder 智能体（默认关闭） |
| `planner_enabled`         | `true`  | 启用 Prometheus (Planner) 智能体 |
| `replace_plan`            | `true`  | 将默认的计划智能体降级为子智能体模式 |

Sisyphus 智能体也可以在 `agents` 下使用其名称进行自定义：`Sisyphus`、`OpenCode-Builder`、`Prometheus (Planner)`、`Metis (Plan Consultant)`。

### Sisyphus 任务

具有依赖跟踪的基于文件的任务持久化，用于跨会话任务管理。任务系统由 `experimental.task_system` 控制（自 v3.14 起默认值为 `true`）。启用后，`TodoWrite`/`TodoRead` 会被拦截并替换为任务工具（`task_create`、`task_get`、`task_list`、`task_update`）。

`sisyphus.tasks` 部分仅配置**存储选项**：

```json
{
  "sisyphus": {
    "tasks": {
      "storage_path": ".omo/tasks",
      "claude_code_compat": false
    }
  }
}
```

| 选项 | 默认值 | 描述 |
| -------------------- | ----------------- | ------------------------------------------ |
| `storage_path`       | `.omo/tasks` | 存储路径（相对于项目根目录） |
| `task_list_id`       | -                 | 强制任务列表 ID（替代环境变量 `ULTRAWORK_TASK_LIST_ID`） |
| `claude_code_compat` | `false`           | 启用 Claude Code 路径兼容模式 |

要完全禁用任务系统，请将 `experimental.task_system` 设置为 `false`：

```json
{
  "experimental": { "task_system": false }
}
```

---

## 功能特性

### 技能

技能带来了特定领域的专业知识和嵌入式 MCP。

内置技能：`playwright`、`playwright-cli`、`agent-browser`、`dev-browser`、`git-master`、`frontend-ui-ux`

禁用内置技能：`{ "disabled_skills": ["playwright"] }`

#### 技能配置

```json
{
  "skills": {
    "sources": [
      { "path": "./my-skills", "recursive": true },
      "https://example.com/skill.yaml"
    ],
    "enable": ["my-skill"],
    "disable": ["other-skill"],
    "my-skill": {
      "description": "What it does",
      "template": "Custom prompt template",
      "from": "source-file.ts",
      "model": "custom/model",
      "agent": "custom-agent",
      "subtask": true,
      "argument-hint": "usage hint",
      "license": "MIT",
      "compatibility": ">= 3.0.0",
      "metadata": { "author": "Your Name" },
      "allowed-tools": ["read", "bash"]
    }
  }
}
```

| `sources` 选项 | 默认值 | 描述 |
| ---------------- | ------- | ------------------------------- |
| `path`           | -       | 本地路径或远程 URL |
| `recursive`      | `false` | 递归进入子目录 |
| `glob`           | -       | 用于文件选择的 Glob 模式 |

### 钩子

通过 `disabled_hooks` 禁用内置钩子：

```json
{ "disabled_hooks": ["comment-checker"] }
```

可用的钩子：`todo-continuation-enforcer`、`context-window-monitor`、`session-recovery`、`session-notification`、`comment-checker`、`tool-output-truncator`、`question-label-truncator`、`directory-agents-injector`、`directory-readme-injector`、`empty-task-response-detector`、`think-mode`、`model-fallback`、`anthropic-context-window-limit-recovery`、`preemptive-compaction`、`rules-injector`、`background-notification`、`auto-update-checker`、`startup-toast`、`keyword-detector`、`agent-usage-reminder`、`non-interactive-env`、`interactive-bash-session`、`thinking-block-validator`、`tool-pair-validator`、`ralph-loop`、`category-skill-reminder`、`compaction-context-injector`、`compaction-todo-preserver`、`claude-code-hooks`、`auto-slash-command`、`edit-error-recovery`、`json-error-recovery`、`delegate-task-retry`、`prometheus-md-only`、`sisyphus-junior-notepad`、`team-tool-gating`、`no-sisyphus-gpt`、`no-hephaestus-non-gpt`、`start-work`、`atlas`、`unstable-agent-babysitter`、`task-resume-info`、`stop-continuation-guard`、`tasks-todowrite-disabler`、`runtime-fallback`、`write-existing-file-guard`、`bash-file-read-guard`、`anthropic-effort`、`hashline-read-enhancer`、`read-image-resizer`、`todo-description-override`、`webfetch-redirect-guard`、`fsync-skip-warning`、`legacy-plugin-toast`

诸如 `team-tool-gating`、`write-existing-file-guard`、`bash-file-read-guard`、`webfetch-redirect-guard`、`prometheus-md-only`、`rules-injector`、`tool-pair-validator` 和 `thinking-block-validator` 等守护钩子用于保护安全性、权限或服务商协议的正确性。仅在受信任的环境中进行经过审计的本地调试时才禁用它们。

**注意：**

- `directory-agents-injector` - 在 OpenCode 1.1.37+ 上自动禁用（原生支持 AGENTS.md）
- `no-sisyphus-gpt` - **请勿禁用**。它为 Sisyphus 阻止不兼容的 GPT 模型，同时允许专用的 GPT-5.4 and GPT-5.5 提示词路径。
- `startup-toast` 是 `auto-update-checker` 的子功能。如果只想禁用提示，请将 `startup-toast` 添加到 `disabled_hooks`。
- `session-recovery` - 自动从可恢复的会话错误（缺失工具结果、不可用工具、思考块违规）中恢复。在恢复期间显示 toast 通知。启用 `experimental.auto_resume` 可以在恢复后自动重试。

### 命令

通过 `disabled_commands` 禁用内置命令：

```json
{ "disabled_commands": ["init-deep", "start-work"] }
```

可用的命令：`init-deep`、`ralph-loop`、`ulw-loop`、`cancel-ralph`、`refactor`、`start-work`、`stop-continuation`、`handoff`

### 浏览器自动化

| 服务商 | 接口 | 安装 |
| ---------------------- | --------- | --------------------------------------------------- |
| `playwright` (默认) | MCP 工具 | 通过 npx 自动安装 |
| `agent-browser`        | Bash CLI  | `bun add -g agent-browser && agent-browser install` |

切换服务商：

```json
{ "browser_automation_engine": { "provider": "agent-browser" } }
```

### Tmux 集成

在独立的 tmux 面板中运行后台子智能体。要求在 tmux 内部运行，并使用 `opencode --port <port>`。

```json
{
  "tmux": {
    "enabled": true,
    "layout": "main-vertical",
    "main_pane_size": 60,
    "main_pane_min_width": 120,
    "agent_pane_min_width": 40
  }
}
```

| 选项 | 默认值 | 描述 |
| ---------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `enabled`              | `false`         | 启用 tmux 面板生成 |
| `layout`               | `main-vertical` | `main-vertical` / `main-horizontal` / `tiled` / `even-horizontal` / `even-vertical` |
| `main_pane_size`       | `60`            | 主面板百分比 (20-80) |
| `main_pane_min_width`  | `120`           | 主面板最小列数 |
| `agent_pane_min_width` | `40`            | 智能体面板最小列数 |

### Git Master

配置 git commit 行为：

```json
{ "git_master": { "commit_footer": true, "include_co_authored_by": true } }
```

### 注释检查器

自定义注释质量检查器：

```json
{
  "comment_checker": {
    "custom_prompt": "Your message. Use {{comments}} placeholder."
  }
}
```

### 通知

强制启用会话通知：

```json
{ "notification": { "force_enable": true } }
```

`force_enable` (`false`) - 即使检测到外部通知插件，也强制启用会话通知。

### MCP

内置 MCP（默认启用）：`websearch` (Exa AI)、`context7`（库文档）、`grep_app` (GitHub 代码搜索)、`lsp`（本地语言服务器工具）和 `ast_grep`（本地结构化搜索/重写工具）。

```json
{ "disabled_mcps": ["websearch", "context7", "grep_app", "lsp", "ast_grep"] }
```

### LSP

LSP 工具由内置的 `lsp` MCP 服务器提供服务（参见 [MCP](#mcp)）。插件配置中以前的顶级 `"lsp"` 块不再读取，并将在下次启动时自动剥离；包含它的现有配置将被静默迁移（参见 `src/shared/migration/config-migration.ts`）。

要配置自定义语言服务器，请在项目根目录下创建 `.opencode/lsp.json`。MCP 服务器将使用 `LSP_TOOLS_MCP_PROJECT_CONFIG=.opencode/lsp.json` 启动，并从该文件中读取服务器映射。Schema 位于 `packages/lsp-tools-mcp` 子模块中（上游：[code-yeongyu/lsp-tools-mcp](https://github.com/code-yeongyu/lsp-tools-mcp)）。

要完全禁用 LSP MCP：

```json
{ "disabled_mcps": ["lsp"] }
```

---

## 高级配置

### 运行时降级

在 API 错误时自动切换到备用模型。

**简单配置**（使用默认值启用/禁用）：

```json
{ "runtime_fallback": true }
```

```json
{ "runtime_fallback": false }
```

**高级配置**（完全控制）：

```json
{
  "runtime_fallback": {
    "enabled": true,
    "retry_on_errors": [429, 500, 502, 503, 504],
    "max_fallback_attempts": 3,
    "cooldown_seconds": 60,
    "timeout_seconds": 30,
    "notify_on_fallback": true
  }
}
```

| 选项 | 默认值 | 描述 |
| ----------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`               | `false`             | 启用运行时降级 |
| `retry_on_errors`       | `[429,500,502,503,504]` | 触发降级的 HTTP 代码。同时处理已分类的服务商密钥错误。 |
| `max_fallback_attempts` | `3`                 | 每个会话的最大降级尝试次数 (1-20) |
| `cooldown_seconds`      | `60`                | 重试失败模型前的冷却秒数 |
| `timeout_seconds`       | `30`                | 强制进行下一次降级前的秒数。**设置为 `0` 可禁用基于超时的升级和 `message.updated` 服务商重试信号检测。** 结构化的 `session.status` 重试事件仍可触发降级。 |
| `notify_on_fallback`    | `true`              | 模型切换时显示 toast 通知 |

#### 加快降级速度（代理 API）

如果你使用的是代理 API 服务商，他们可能会在额度耗尽或模型不可用时返回不同的错误代码（例如 `401`、`403`、`404`）。为了让降级立即触发而无需等待漫长的超时：

```jsonc
{
  "runtime_fallback": {
    "enabled": true,
    // 将代理的特定错误代码添加到 retry_on_errors 中
    "retry_on_errors": [400, 401, 403, 404, 429, 500, 502, 503, 504],
    "max_fallback_attempts": 3,
    "cooldown_seconds": 15, // 更短的冷却时间
    "timeout_seconds": 10   // 更快地检测挂起的代理请求
  }
}
```

为每个智能体或类别定义 `fallback_models`：

```json
{
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-opus-4-7",
      "fallback_models": [
        "openai/gpt-5.5",
        {
          "model": "google/gemini-3.1-pro",
          "variant": "high"
        }
      ]
    }
  }
}
```

`fallback_models` 还支持对象样式的条目，以便你可以将设置附加到特定的降级模型：

```json
{
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-opus-4-7",
      "fallback_models": [
        "openai/gpt-5.5",
        {
          "model": "anthropic/claude-sonnet-4-6",
          "variant": "high",
          "thinking": { "type": "enabled", "budgetTokens": 12000 }
        },
        {
          "model": "openai/gpt-5.3-codex",
          "reasoningEffort": "high",
          "temperature": 0.2,
          "top_p": 0.95,
          "maxTokens": 8192
        }
      ]
    }
  }
}
```

允许混合数组，因此字符串条目和对象条目可以一起出现在同一个降级链中。

#### 对象样式的 `fallback_models`

对象条目使用以下格式：

| 字段 | 类型 | 描述 |
| ----- | ---- | ----------- |
| `model` | string | 降级模型 ID。当 OmO 可以继承当前/默认服务商时，服务商前缀是可选的。 |
| `variant` | string | 此降级条目的显式变体覆盖。 |
| `reasoningEffort` | string | 此降级条目的 OpenAI 推理能力覆盖。 |
| `temperature` | number | 如果此降级模型激活，则应用的温度。 |
| `top_p` | number | 如果此降级模型激活，则应用的 Top-p。 |
| `maxTokens` | number | 如果此降级模型激活，则应用的最大响应 token 数。 |
| `thinking` | object | 如果此降级模型激活，则应用的 Anthropic 思考配置。 |

单模型设置**仅在降级时生效**。它们仅在实际选择该特定降级模型时才会被提升，因此当主要模型成功解析时，它们不会覆盖你的主要模型设置。

`thinking` 使用与普通智能体/类别选项相同的格式：

| 字段 | 类型 | 描述 |
| ----- | ---- | ----------- |
| `type` | string | `enabled` 或 `disabled` |
| `budgetTokens` | number | 可选的 Anthropic 思考预算 |

当 OmO 可以从当前/默认服务商推断出服务商前缀时，对象条目也可以省略服务商前缀。如果你在 `model` 中同时提供了内联变体语法和显式的 `variant` 字段，显式的 `variant` 字段会胜出。

#### 完整示例

**1. 简单的字符串链**

当你只需要一个还原的降级链时，使用字符串：

```json
{
  "agents": {
    "atlas": {
      "model": "anthropic/claude-sonnet-4-6",
      "fallback_models": [
        "anthropic/claude-haiku-4-5",
        "openai/gpt-5.5",
        "google/gemini-3.1-pro"
      ]
    }
  }
}
```

**2. 相同服务商简写**

如果主要模型已经确定了服务商，降级条目可以省略前缀：

```json
{
  "agents": {
    "atlas": {
      "model": "openai/gpt-5.5",
      "fallback_models": [
        "gpt-5.4-mini",
        {
          "model": "gpt-5.3-codex",
          "reasoningEffort": "medium",
          "maxTokens": 4096
        }
      ]
    }
  }
}
```

在此示例中，OmO 将 `gpt-5.4-mini` 和 `gpt-5.3-codex` 视为 OpenAI 降级条目，因为当前/默认服务商已经是 `openai`。

**3. 混合跨服务商链**

当只有某些降级模型需要特殊设置时，混合使用字符串条目和对象条目：

```json
{
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-opus-4-7",
      "fallback_models": [
        "openai/gpt-5.5",
        {
          "model": "anthropic/claude-sonnet-4-6",
          "variant": "high",
          "thinking": { "type": "enabled", "budgetTokens": 12000 }
        },
        {
          "model": "google/gemini-3.1-pro",
          "variant": "high"
        }
      ]
    }
  }
}
```

**4. 类别级别的降级链**

`fallback_models` 在 `categories` 下的工作方式相同：

```json
{
  "categories": {
    "deep": {
      "model": "openai/gpt-5.3-codex",
      "fallback_models": [
        {
          "model": "openai/gpt-5.5",
          "reasoningEffort": "xhigh",
          "maxTokens": 12000
        },
        {
          "model": "anthropic/claude-opus-4-7",
          "variant": "max",
          "temperature": 0.2
        },
        "google/gemini-3.1-pro(high)"
      ]
    }
  }
}
```

**5. 包含所有支持字段的完整对象条目**

这在一个地方展示了每个支持的对象样式参数：

```json
{
  "agents": {
    "oracle": {
      "model": "openai/gpt-5.5",
      "fallback_models": [
        {
          "model": "openai/gpt-5.3-codex(low)",
          "variant": "xhigh",
          "reasoningEffort": "high",
          "temperature": 0.3,
          "top_p": 0.9,
          "maxTokens": 8192,
          "thinking": {
            "type": "disabled"
          }
        }
      ]
    }
  }
}
```

在此示例中，显式的 `"variant": "xhigh"` 覆盖了 `"model"` 中内联的 `(low)` 后缀。

这最后一个示例是一个**完整的格式参考**。在实际配置中，请首选适合服务商的设置：

- 对 OpenAI 推理模型使用 `reasoningEffort`
- 对支持思考的 Anthropic 模型使用 `thinking`
- 仅在降级模型支持时才使用 `variant`、`temperature`、`top_p` 和 `maxTokens`

### 模型能力

OmO 可以在启动时刷新本地 models.dev 能力快照。此缓存由 `model_capabilities` 控制。

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

| 选项 | 默认行为 | 描述 |
| ------ | ---------------- | ----------- |
| `enabled` | 启用，除非显式设置为 `false` | 模型能力刷新行为的主开关 |
| `auto_refresh_on_start` | 启动时刷新，除非显式设置为 `false` | 在启动检查期间刷新本地 models.dev 缓存 |
| `refresh_timeout_ms` | `5000` | 启动刷新尝试的超时时间 |
| `source_url` | `https://models.dev/api.json` | 覆盖 models.dev 源 URL |

注意：

- 启动刷新通过自动更新检查器钩子运行。
- 可以通过 `bunx oh-my-opencode refresh-model-capabilities` 进行手动刷新。
- 当 OmO 解析能力以进行兼容性检查时，服务商运行时元数据仍具有优先级。

### Hashline 编辑

使用使用 `LINE#ID` 引用的哈希锚定版本替换内置的 `Edit` 工具，以防止编辑过时的行。默认禁用。

```json
{ "hashline_edit": true }
```

启用后，OmO 会注册哈希锚定的 `edit` 工具，并激活 `hashline-read-enhancer` 伴生钩子，该钩子会使用 `LINE#ID` 标记对 Read 输出进行注释。通过设置 `hashline_edit: true` 来选择加入。如果需要，可以通过 `disabled_hooks` 禁用伴生钩子。

### 实验性功能

```json
{
  "experimental": {
    "truncate_all_tool_outputs": false,
    "aggressive_truncation": false,
    "auto_resume": false,
    "disable_omo_env": false,
    "task_system": true,
    "dynamic_context_pruning": {
      "enabled": false,
      "notification": "detailed",
      "turn_protection": { "enabled": true, "turns": 3 },
      "protected_tools": [
        "task",
        "todowrite",
        "todoread",
        "lsp_rename",
        "session_read",
        "session_write",
        "session_search"
      ],
      "strategies": {
        "deduplication": { "enabled": true },
        "supersede_writes": { "enabled": true, "aggressive": false },
        "purge_errors": { "enabled": true, "turns": 5 }
      }
    }
  }
}
```

| 选项 | 默认值 | 描述 |
| ---------------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `truncate_all_tool_outputs`              | `false`    | 截断所有工具输出（不仅是白名单中的） |
| `aggressive_truncation`                  | `false`    | 当超出 token 限制时进行激进截断 |
| `auto_resume`                            | `false`    | 在思考块恢复后自动恢复 |
| `disable_omo_env`                        | `false`    | 禁用自动注入的 `<omo-env>` 块（日期/时间/区域设置）。提高缓存命中率。 |
| `task_system`                            | `false`    | 启用 Sisyphus 任务系统 |
| `dynamic_context_pruning.enabled`        | `false`    | 自动修剪旧的工具输出以管理上下文窗口 |
| `dynamic_context_pruning.notification`   | `detailed` | 修剪通知：`off` / `minimal` / `detailed` |
| `turn_protection.turns`                  | `3`        | 保护免受修剪的最近轮数 (1-10) |
| `strategies.deduplication`               | `true`     | 移除重复的工具调用 |
| `strategies.supersede_writes`            | `true`     | 当文件稍后被读取时，修剪写入输入 |
| `strategies.supersede_writes.aggressive` | `false`    | 如果存在任何后续读取，则修剪任何写入 |
| `strategies.purge_errors.turns`          | `5`        | 修剪出错工具输入前的轮数 |

---

## 参考信息

### 环境变量

| 变量 | 描述 |
| --------------------- | ----------------------------------------------------------------- |
| `OPENCODE_CONFIG_DIR` | 覆盖 OpenCode 配置目录（对配置文件隔离很有用） |
| `OMO_SEND_ANONYMOUS_TELEMETRY` | 设置为 `0`、`false` 或 `no` 以禁用匿名遥测 |
| `OMO_DISABLE_POSTHOG` | 旧版遥测选择退出标志。设置为 `1` 或 `true` 以禁用 PostHog |
| `POSTHOG_API_KEY` | 可选覆盖内置的 PostHog 项目 API 密钥 |
| `POSTHOG_HOST` | 覆盖 PostHog 接收主机。默认为 `https://us.i.posthog.com` |

### 特定服务商

#### Google 身份验证

为 Google Gemini 安装 [`opencode-antigravity-auth`](https://github.com/NoeFabris/opencode-antigravity-auth)。提供多账号负载均衡、双重配额和基于变体的思考。

#### Ollama

**必须**禁用流式传输以避免 JSON 解析错误：

```json
{
  "agents": {
    "explore": { "model": "ollama/qwen3-coder" }
  }
}
```

**注意：** `stream` 选项应该在你的 OpenCode 设置中或通过环境变量进行配置，而不是在智能体配置中。有关禁用流式传输的详细信息，请参阅 [Ollama 故障排除](../troubleshooting/ollama.md)。

常用模型：`ollama/qwen3-coder`、`ollama/ministral-3:14b`、`ollama/lfm2.5-thinking`

有关 `JSON Parse error: Unexpected EOF` 问题，请参阅 [Ollama 故障排除](../troubleshooting/ollama.md)。
