# 团队模式 (Team Mode)

omo 的并行多智能体协同机制，模仿了 Claude Code 的实验性智能体团队 (Agent Teams)。

## 状态

默认关闭。可以通过 JSONC 配置启用。

## 适用场景

- 具有边界协同的并行探索。
- 拆分到不同专业智能体中的长期、多步骤重构。
- 需要共享任务列表的研究与实现流水线。

## 启用方法

在用户配置 `~/.config/opencode/oh-my-openagent.jsonc` 或项目配置 `.opencode/oh-my-openagent.jsonc` 中添加以下内容：

```jsonc
{
  "team_mode": {
    "enabled": true,
    "max_parallel_members": 4,
    "max_members": 8,
    "tmux_visualization": false
  }
}
```

启用后，重启 opencode。12 个 `team_*` 工具即可使用。

> Bug 修复说明：v4.2.1 为该极简配置添加了全新安装的回归测试，并在启动期间记录解析后的 `team_mode` 状态以及团队工具数量。如果重启后工具仍未出现，请检查 `oh-my-opencode.log` 以获取加载的配置路径和 `[tool-registry] Built tool registry` 条目。

## 配置模式 (11 个字段)

所有字段都位于 `team_mode` 下：

- `enabled` (布尔值，默认 `false`)
- `tmux_visualization` (布尔值，默认 `false`)
- `max_parallel_members` (整数，`1..8`，默认 `4`)
- `max_members` (整数，`1..8`，默认 `8`)
- `max_messages_per_run` (整数，`>=1`，默认 `10000`)
- `max_wall_clock_minutes` (整数，`>=1`，默认 `120`)
- `max_member_turns` (整数，`>=1`，默认 `500`)
- `base_dir` (可选字符串，默认解析为 `~/.omo`)
- `message_payload_max_bytes` (整数，`>=1024`，默认 `32768`)
- `recipient_unread_max_bytes` (整数，`>=1024`，默认 `262144`)
- `mailbox_poll_interval_ms` (整数，`>=500`，默认 `3000`)

## 定义团队

团队规范文件位于 `~/.omo/teams/{name}/config.json` (用户作用域) 或 `<project>/.omo/teams/{name}/config.json` (项目作用域)：

```json
{
  "name": "ccapi-explorers",
  "description": "Explore the ccapi project structure.",
  "lead": { "kind": "subagent_type", "subagent_type": "sisyphus" },
  "members": [
    { "kind": "category", "name": "scout-1", "category": "deep", "prompt": "Scout the src/ dir for auth patterns." },
    { "kind": "category", "name": "scout-2", "category": "quick", "prompt": "Scout tests for auth coverage." }
  ]
}
```

当两个作用域定义了相同的团队名称时，项目作用域优先。

配置文件中的 `version`、`createdAt` 和 `leadAgentId` 是可选的。加载器会自动填充这些字段。你可以编写顶层的 `lead: {...}` 简写，或者将其中一个成员标记为 `isLead: true`，或者在团队仅有一个成员时将两者都省略。

## 成员类型

- **`kind: "subagent_type"`**：直接智能体 (atlas, sisyphus, sisyphus-junior, hephaestus)。`prompt` 可选。
- **`kind: "category"`**：通过 `sisyphus-junior` 路由，并使用所选的类别模型。`prompt` 必填。

## 可用智能体

- **可用：** `sisyphus`, `atlas`, `sisyphus-junior`。
- **有条件可用：** `hephaestus` (需要队友权限 `teammate: "allow"`，否则请使用 `subagent_type: "sisyphus"`)。
- **强硬拒绝：** `oracle`, `librarian`, `explore`, `multimodal-looker`, `metis`, `momus`, `prometheus`。

强硬拒绝的智能体无法通过 TeamSpec 解析，因为它们无法写入邮箱状态。对于这些智能体，请使用 `delegate-task`。

## 生命周期

1. `team_create`：创建团队和成员会话。
2. 负责人通过 `team_send_message`、`team_task_create` 分配工作。
3. 成员认领任务 (使用 `team_task_update` 将 `status` 设为 `"claimed"`)，并通过 `team_send_message` 进行汇报。
4. `team_shutdown_request` → 成员或负责人通过 `team_approve_shutdown` / `team_reject_shutdown` 进行确认。
5. `team_delete`：移除运行时状态、工作区 (worktrees) 以及可选的 tmux 布局。

## 12 个工具

| 工具 | 用途 |
|------|---------|
| `team_create` | 创建团队。 |
| `team_delete` | 销毁团队 (仅限负责人，且无活跃成员)。 |
| `team_shutdown_request` | 负责人要求成员结束工作。 |
| `team_approve_shutdown` / `team_reject_shutdown` | 成员或负责人做出响应。 |
| `team_send_message` | 点对点邮箱，负责人专属广播。 |
| `team_task_create` / `_list` / `_update` / `_get` | 共享任务列表。 |
| `team_status` | 聚合运行时视图。 |
| `team_list` | 已声明和活跃的团队。 |

## 限制 (默认值)

- 最多 8 个成员，同时运行最多 4 个。
- 每个消息体最大 32 KB，每个接收者未读消息最大 256 KB。
- 每次运行最多 10,000 条消息，实际运行时间最多 120 分钟，每个成员最多 500 个轮次。

## 工作区 (每个成员可选)

在成员条目中添加 `"worktreePath": "../wt-scout"`。路径可以是相对于文件系统的相对路径或绝对路径，纯分支名称会被拒绝。需要安装 `git`。

## tmux 可视化 (可选)

设置 `tmux_visualization: true`。需要运行在 tmux 会话中，且 tmux 必须在 PATH 环境变量中。故障是隔离的，缺失 tmux 绝不会阻止团队的创建。

启用后，每个成员都会获得一个专属的 tmux 面板 (pane)，通过 `opencode attach` 连接到该成员的会话。该面板为成员运行完整的交互式 opencode TUI，以便你可以实时观看流式输出。如果配置了工作区，面板将在每个成员的工作区中启动，否则在仓库根目录启动。

`team_delete` 会关闭这些面板并销毁团队布局。单个成员的关闭只会关闭该面板，并重新平衡剩余的布局。

## 团队模式不支持的操作

- 不支持嵌套团队 (成员无法调用 `team_create`)。
- 不支持同步等待回复 (`team_send_message` 是即发即弃的)。
- 不支持成员驱动的 `delegate-task` (预算默认为 0)。
- 不支持绕过关闭流程，`team_delete` 会拒绝存在活跃成员的团队。

## 诊断

`bunx oh-my-opencode doctor` 包含 `team-mode` 检查，显示 tmux/git 的可用性、已声明的团队数量以及活跃的运行时目录。

## 存储布局

```
~/.omo/
├── teams/{name}/config.json                      # 已声明的规范
├── .highwatermark                                # 运行时状态的奇偶校验标记
└── runtime/{teamRunId}/
    ├── state.json                                # 持久化运行时状态
    ├── inboxes/{member}/{uuid}.json              # 邮箱 (每个消息的原子文件)
    ├── inboxes/{member}/.delivering-{uuid}.json  # 瞬态实时投递预留
    ├── inboxes/{member}/processed/               # 已确认的消息
    └── tasks/{id}.json                           # 共享任务列表
```

`.delivering-{uuid}.json` 文件仅在通过 `promptAsync` 实时投递消息时存在。投递成功后，它们会被提交到 `processed/`；投递失败时，它们会被释放回 `{uuid}.json`；如果因崩溃而滞留，则在团队恢复时被回收 (生存时间 TTL 为 10 分钟)。`listUnreadMessages` 会忽略点文件 (dotfile) 条目，因此回退轮询绝不会重复注入已预留的消息。

## 参考

完整设计：`.omo/plans/team-mode.md`。
