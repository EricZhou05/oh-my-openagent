import type { DefaultModeConfig } from "../config/schema/default-mode"
import {
  getSparkShellRuntimeAwareness,
  hasSparkShellRuntimeAwareness,
} from "../shared/sparkshell-awareness"

const ULTRAWORK_MODE_TAG = "<ultrawork-mode>"
const CHINESE_FORCE_TAG = ""
const CHINESE_FORCE_RULE = `
> **CRITICAL: YOU MUST ALWAYS REPLY TO THE USER IN CHINESE. THIS IS THE HIGHEST PRIORITY.**
> **重要：必须始终使用中文回答用户。这是最高优先级。**
> **CRITICAL: ALL tool calls MUST have their descriptions written strictly in Chinese.**
> **重要：必须使用中文来填写所有工具调用的描述字段。**
`

export function createSystemTransformHandler(
  defaultMode?: DefaultModeConfig,
  getUltraworkMessage?: (agentName?: string, modelID?: string) => string,
  env: Readonly<Record<string, string | undefined>> = process.env,
): (
  input: { sessionID?: string; model: { id: string; providerID: string; [key: string]: unknown } },
  output: { system: string[] },
) => Promise<void> {
  return async (input, output): Promise<void> => {
    if (!output.system.some((part) => part.includes(CHINESE_FORCE_TAG))) {
      output.system.push(CHINESE_FORCE_TAG + CHINESE_FORCE_RULE)
    }

    const sparkshellAwareness = getSparkShellRuntimeAwareness(env)
    if (
      sparkshellAwareness.length > 0 &&
      !output.system.some(hasSparkShellRuntimeAwareness)
    ) {
      output.system.push(sparkshellAwareness)
    }

    if (!defaultMode?.ultrawork || !getUltraworkMessage) return

    // Avoid re-injecting if the ultrawork prompt is already in the system prompt
    // (e.g. after compaction the system prompt is rebuilt and this hook fires again)
    if (output.system.some((part) => part.includes(ULTRAWORK_MODE_TAG))) return

    const modelID = input.model?.id
    const ultraworkMessage = getUltraworkMessage("sisyphus", modelID)
    if (!ultraworkMessage) return

    output.system.push(ultraworkMessage)
  }
}