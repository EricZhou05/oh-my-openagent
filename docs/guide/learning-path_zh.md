# Oh My OpenAgent 学习路径与中文文档顺序阅读指南

> **欢迎！** 为了防止在众多技术文档和配置参数中迷失，本指南为您梳理了一条**由浅入深、循序渐进**的顺序阅读路径。所有的文档均已提供完整的中文版，您可以直接点击下方链接在编辑器中跳转阅读。

---

## 🧭 阶段一：新手入门（核心概念与安装）
*在开始写代码之前，先理解这个项目的本质和运行机制。*

1. [【第一步】项目概览指南](./overview_zh.md)
   - **为什么读**：理解项目的核心哲学，认识纪律智能体 Sisyphus、正统匠人 Hephaestus 等全家桶成员，以及为什么它能超越原生的 Claude Code。
2. [【第二步】环境安装与配置指南](./installation_zh.md)
   - **为什么读**：手把手教您如何通过命令行进行交互式或非交互式安装，配置服务提供商并管理 API 密钥。

---

## 🧠 阶段二：核心编排（多模型协调与配合）
*深入理解“多智能体编排”和“模型搭配”的精髓。这是解决复杂工程问题的核心。*

3. [【第三步】多智能体编排系统指南](./orchestration_zh.md)
   - **为什么读**：深入理解 Prometheus（规划）、Metis（ gaps 分析）、Momus（评审）与 Atlas（执行）如何形成生产力闭环。
4. [【第四步】智能体与模型匹配指南](./agent-model-matching_zh.md)
   - **为什么读**：了解哪些模型适合哪些智能体，如何通过 Fallback 链在成本和智能度之间取得完美平衡（例如 OpenCode Go + OpenAI 组合）。

---

## 🛠️ 阶段三：特性与工具实践（功能开发与配置）
*开始实战！掌握所有可用的工具命令和配置参数。*

5. [【第五步】核心特性与组件细节指南](../reference/features_zh.md)
   - **为什么读**：全面解析 Hashline 标点哈希修改工具、LSP/AST 重构工具、Tmux 交互、以及内置的 MCP 服务等细节。
6. [【第六步】配置项参数参考手册](../reference/configuration_zh.md)
   - **为什么读**：查询 `oh-my-openagent.jsonc` 配置文件中每一个 Zod 校验字段的作用和修改方式。
7. [【第七步】CLI 命令行工具参考手册](../reference/cli_zh.md)
   - **为什么读**：学习如何通过命令行执行 `doctor` 医生检查、非交互式 `run` 任务、以及 MCP OAuth 登录。

---

## 👥 阶段四：高级进阶（团队模式与内部设计）
*探索真正的多智能体协同，以及内部的技术架构设计。*

8. [【第八步】团队模式 (Team Mode) 指南](./team-mode_zh.md)
   - **为什么读**：开启多智能体并行协作。了解如何在 Tmux 网格中实时监控 8 个智能体同时工作，以及 `hyperplan`（对抗性规划）和 `security-research`（安全审计）技能。
9. [【第九步】异步提示词防并发重入技术白皮书](../reference/prompt-async-gate-rfc_zh.md)
   - **为什么读**：针对插件开发者的 RFC 设计文档。深入研究为了防止多个并发操作同时向父主会话注入指令而设计的闸门（Async Gate）机制。
10. [【第十步】规则注入机制跨模块对比与最佳实践](../reference/rules-injection-cross-module-comparison_zh.md)
    - **为什么读**：理解 `rules-injector` 是如何扫描 `.omo/rules/` 等规则，并动态将规范注入到 AI 的上下文中。

---

## 📐 阶段五：规格书、维护与疑难解答
*深度贡献者或遇到技术障碍时的查阅指南。*

11. [【第十一步】多版本模型配置兼容设计说明](../superpowers/specs/2026-03-17-model-settings-compatibility-design_zh.md)
    - **为什么读**：深入理解配置项向下兼容和模型变体动态转换的底层机制。
12. [【第十二步】后台任务重试机制时间轴设计说明](../superpowers/specs/2026-04-27-background-task-retry-timeline-design_zh.md)
    - **为什么读**：探究后台高并发 API 请求失败时的指数退避与重试机制的底层逻辑。
13. [【第十三步】模型能力维护与缓存刷新指南](../model-capabilities-maintenance_zh.md)
    - **为什么读**：了解 `models.dev` 能力缓存的作用，以及如何刷新本地缓存。
14. [【第十四步】Ollama 本地部署与通信疑难解答](../troubleshooting/ollama_zh.md)
    - **为什么读**：如果您计划在本地脱网运行开源 LLM，这篇文档提供了必不可少的端口与通信排查方法。
15. [【第十五步】已知问题与临时规避方案](../reference/known-issues_zh.md)
    - **为什么读**：当您在使用过程中遇到报错或异常时，第一时间在这里寻找已知的 Workarounds。
16. [【第十六步】版本发布流程与 CI 规范](../reference/release-process_zh.md)
    - **为什么读**：对于代码库的维护者，这篇文档规定了严格的双包发布和 PR 合并策略。

---

## 🏛️ 阶段六：项目哲学与法律声明
17. [Ultrawork 宣言（Ultrawork Manifesto）](../manifesto_zh.md)
18. [隐私政策声明](../legal/privacy-policy_zh.md)
19. [服务使用条款声明](../legal/terms-of-service_zh.md)

---

> **💡 阅读贴士**：
> 1. 打开您的 VS Code、Cursor 或 OpenCode 编辑器。
> 2. 打开本文件：`docs/guide/learning-path_zh.md`。
> 3. 按住 `Ctrl` 键（macOS 上为 `Cmd` 键）并点击上面的超链接，即可直接**秒级跳转**至对应的中文文档！
