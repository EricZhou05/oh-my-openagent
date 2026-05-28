# CLI 参考

已发布的 CLI 包的完整参考。在重命名过渡期间，两个包名均可使用：

- `oh-my-openagent`（首选包名）
- `oh-my-opencode`（兼容包名）

`opencode.json` 中的插件注册首选 `oh-my-openagent`。

## 基本用法

```bash
# 显示帮助信息（首选包）
bunx oh-my-openagent

# 兼容包
bunx oh-my-opencode
```

## 命令

| 命令 | 描述 |
| --- | --- |
| `install` | 交互式设置向导 |
| `doctor` | 安装健康状况诊断 |
| `run <message>` | 具有强制完成机制的非交互式 OpenCode 会话运行器 |
| `get-local-version` | 显示当前安装的版本并检查更新 |
| `refresh-model-capabilities` | 从 models.dev 刷新缓存的模型能力快照 |
| `boulder` | 检查 Sisyphus boulder 工作状态（活动计划、单项任务计时器、会话谱系） |
| `version` | 显示 CLI 版本 |
| `mcp oauth` | MCP 服务器的 OAuth 令牌管理 |

---

## install

用于初始设置的交互式安装工具。

### 用法

```bash
bunx oh-my-openagent install
```

### 选项

| 选项 | 描述 |
| --- | --- |
| `--no-tui` | 以非交互模式运行（需要提供所有必需的选项） |
| `--claude <value>` | Claude 订阅：`no`、`yes`、`max20` |
| `--openai <value>` | OpenAI/ChatGPT 订阅：`no`、`yes` |
| `--gemini <value>` | Gemini 集成：`no`、`yes` |
| `--copilot <value>` | GitHub Copilot 订阅：`no`、`yes` |
| `--opencode-zen <value>` | OpenCode Zen 访问权限：`no`、`yes` |
| `--zai-coding-plan <value>` | Z.ai Coding Plan 订阅：`no`、`yes` |
| `--kimi-for-coding <value>` | Kimi For Coding 订阅：`no`、`yes` |
| `--opencode-go <value>` | OpenCode Go 订阅：`no`、`yes` |
| `--vercel-ai-gateway <value>` | Vercel AI Gateway：`no`、`yes` |
| `--skip-auth` | 跳过身份验证设置提示 |

匿名遥测使用 PostHog 并配合哈希处理后的安装标识符。使用 `OMO_SEND_ANONYMOUS_TELEMETRY=0` 或 `OMO_DISABLE_POSTHOG=1` 可以禁用此功能。

---

## doctor

诊断您的环境和配置。检查分为四个类别：**System（系统）**、**Config（配置）**、**Tools（工具）** 和 **Models（模型）**。

### 用法

```bash
bunx oh-my-openagent doctor
```

### 选项

| 选项 | 描述 |
| --- | --- |
| `--status` | 显示精简的系统仪表板 |
| `--verbose` | 显示详细的诊断信息 |
| `--json` | 以 JSON 格式输出结果 |

### 注意事项

- 当前最低 OpenCode 版本检查为 `>= 1.4.0`。
- 当 `opencode.json` 中仍存在旧版插件注册（`oh-my-opencode`）时，doctor 命令会发出警告。

---

## run

运行非交互式会话，且仅在以下两个条件均满足时退出：

- 所有待办事项（todos）均已完成或取消
- 所有后台子会话均处于空闲状态

### 用法

```bash
bunx oh-my-openagent run <message>
```

### 选项

| 选项 | 描述 |
| --- | --- |
| `-a, --agent <name>` | 要使用的智能体（适用默认解析链） |
| `-m, --model <provider/model>` | 覆盖模型（例如：`anthropic/claude-sonnet-4`） |
| `-d, --directory <path>` | 工作目录 |
| `-p, --port <port>` | 服务器端口（如果已被占用则进行附加） |
| `--attach <url>` | 附加到现有的 OpenCode 服务器 URL |
| `--on-complete <command>` | 完成后运行 Shell 命令 |
| `--json` | 输出结构化的 JSON 结果 |
| `--no-timestamp` | 禁用输出中的时间戳前缀 |
| `--verbose` | 显示完整的事件流（默认：仅显示消息/工具） |
| `--session-id <id>` | 恢复现有的会话 |

### 智能体解析顺序

1. `--agent`
2. `OPENCODE_DEFAULT_AGENT`
3. 插件配置中的 `default_run_agent`
4. `Sisyphus`

---

## get-local-version

显示本地插件版本状态和更新状态。

### 用法

```bash
bunx oh-my-openagent get-local-version
```

### 选项

| 选项 | 描述 |
| --- | --- |
| `-d, --directory <path>` | 用于插件/配置检测的工作目录 |
| `--json` | 输出用于脚本编写的 JSON |

---

## refresh-model-capabilities

从 models.dev 刷新缓存的模型能力快照。

### 用法

```bash
bunx oh-my-openagent refresh-model-capabilities
```

### 选项

| 选项 | 描述 |
| --- | --- |
| `-d, --directory <path>` | 用于读取插件配置的工作目录 |
| `--source-url <url>` | 覆盖 models.dev 源 URL |
| `--json` | 以 JSON 格式输出刷新摘要 |

### 配置

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

---

## version

显示 CLI 包版本。

### 用法

```bash
bunx oh-my-openagent version
```

---

## mcp oauth

MCP 服务器的 OAuth 令牌管理（第 3 层 MCP OAuth 流程，包括 PKCE 以及在服务器支持时进行动态客户端注册）。

### 用法

```bash
# 进行身份验证
bunx oh-my-openagent mcp oauth login <server-name> --server-url https://api.example.com

# 使用显式客户端 ID 和作用域进行身份验证
bunx oh-my-openagent mcp oauth login <server-name> --server-url https://api.example.com --client-id my-client --scopes read write

# 移除存储的令牌
bunx oh-my-openagent mcp oauth logout <server-name> --server-url https://api.example.com

# 显示令牌状态
bunx oh-my-openagent mcp oauth status [server-name]
```

### 选项

| 选项 | 描述 |
| --- | --- |
| `--server-url <url>` | OAuth 服务器 URL（`login` 和 `logout` 均需要） |
| `--client-id <id>` | OAuth 客户端 ID（如果服务器支持 DCR 则为可选） |
| `--scopes <scopes...>` | 作为可变参数的 OAuth 作用域 |

---

## 退出码

- 成功时为 `0`
- 失败时为 `1`

`run`、`install`、`doctor`、`get-local-version`、`refresh-model-capabilities` 和 `mcp oauth` 子命令会返回明确的数字退出码。
