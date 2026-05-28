# Ollama 问题排查

## 流式传输问题：JSON 解析错误

### 问题

当使用 Ollama 作为 oh-my-openagent 智能体的服务商（provider）时，您可能会遇到以下错误：

```
JSON Parse error: Unexpected EOF
```

这通常发生在智能体尝试进行工具调用时（例如，`explore` 智能体使用 `mcp_grep_search`）。

### 根本原因

在 API 请求中使用 `stream: true` 时，Ollama 会返回 **NDJSON**（换行符分隔的 JSON）：

```ndjson
{"message":{"tool_calls":[{"function":{"name":"read","arguments":{"filePath":"README.md"}}}]}, "done":false}
{"message":{"content":""}, "done":true}
```

Claude Code SDK 期望接收单个 JSON 对象，而不是多行 NDJSON，从而导致了解析错误。

**发生此问题的原因：**
- **Ollama API**：在设计上将流式响应作为 NDJSON 返回
- **Claude Code SDK**：无法正确处理工具调用的 NDJSON 响应
- **oh-my-openagent**：直接透传了 SDK 的行为（无法在此层进行修复）

## 解决方案

### 方案 1：禁用流式传输（推荐）

将您的 Ollama 服务商配置为使用 `stream: false`：

```json
{
  "provider": "ollama",
  "model": "qwen3-coder",
  "stream": false
}
```

**优点：**
- 立即生效
- 无需修改代码
- 配置简单

**缺点：**
- 响应时间略慢（无流式传输）
- 交互式反馈较少

### 方案 2：仅使用不带工具的智能体

如果您需要流式传输，请避免使用需要调用工具的智能体：

- **安全**：简单的文本生成、非工具类任务
- **存在问题**：任何带有工具调用的智能体（如 explore、librarian 等）

### 方案 3：等待 SDK 修复

彻底的修复需要 Claude Code SDK 能够：

1. 检测 NDJSON 响应
2. 分别解析每一行
3. 合并来自多行的 `tool_calls`
4. 返回单个合并后的响应

**问题追踪**：https://github.com/code-yeongyu/oh-my-openagent/issues/1124（已关闭，已记录临时解决方案）

## 临时解决方案实现

在 SDK 修复之前，以下是实现 NDJSON 解析的方法（供 SDK 维护者参考）：

```typescript
async function parseOllamaStreamResponse(response: string): Promise<object> {
  const lines = response.split('\n').filter(line => line.trim());
  const mergedMessage = { tool_calls: [] };

  for (const line of lines) {
    try {
      const json = JSON.parse(line);
      if (json.message?.tool_calls) {
        mergedMessage.tool_calls.push(...json.message.tool_calls);
      }
      if (json.message?.content) {
        mergedMessage.content = json.message.content;
      }
    } catch (e) {
      // Skip malformed lines
      console.warn('Skipping malformed NDJSON line:', line);
    }
  }

  return mergedMessage;
}
```

## 测试

验证修复是否生效：

```bash
# 使用 curl 进行测试（在 stream: false 时应正常工作）
curl -s http://localhost:11434/api/chat \
  -d '{
    "model": "qwen3-coder",
    "messages": [{"role": "user", "content": "Read file README.md"}],
    "stream": false,
    "tools": [{"type": "function", "function": {"name": "read", "description": "Read a file", "parameters": {"type": "object", "properties": {"filePath": {"type": "string"}}, "required": ["filePath"]}}}]
  }'
```

## 相关问题

- **oh-my-openagent**：https://github.com/code-yeongyu/oh-my-openagent/issues/1124（已关闭，已记录临时解决方案）
- **Ollama API 文档**：https://github.com/ollama/ollama/blob/main/docs/api.md

## 获取帮助

如果您遇到此问题：

1. 检查您的 Ollama 服务商配置
2. 将 `stream: false` 设置为临时解决方案
3. 向问题追踪器（issue tracker）报告任何其他错误
4. 提供您的配置信息（不包含敏感凭据）以便进行调试
