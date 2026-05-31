export const TODOWRITE_DESCRIPTION = `Use this tool to create and manage a structured task list for tracking progress on multi-step work.

## OpenCode Schema Contract

The upstream OpenCode \`todowrite\` schema expects each todo item to include:

- \`content\`: string
- \`status\`: string, one of \`pending\`, \`in_progress\`, \`completed\`, \`cancelled\`
- \`priority\`: string, one of \`high\`, \`medium\`, \`low\`

\`priority\` is a string field. Never send numeric priorities such as \`0\`, \`1\`, \`2\`, or labels such as \`P0\`, \`P1\`, \`P2\`.

## Todo Format (MANDATORY)

Each todo title MUST encode four elements: WHERE, WHY, HOW, and EXPECTED RESULT.

Format: "[受影响文件/位置] [如何修改] 以 [达到什么目的] - 期望 [结果]"

GOOD:
- "src/utils/validation.ts: 添加 validateEmail() 以处理输入清洗 - 期望返回 boolean"
- "UserService.create(): 在 DB 插入前调用 validateEmail() 以作校验 - 期望拒绝非法邮箱并返回 400"
- "validation.test.ts: 针对缺失 @ 符号添加测试 以覆盖边缘情况 - 期望 validateEmail('foo') 返回 false"

BAD:
- "Implement email validation" (where? how? what result?)
- "Add dark mode" (feature, not a todo)
- "Fix auth" (what file? what changes? what's expected?)

## Granularity Rules

Each todo MUST be a single atomic action completable in 1-3 tool calls. If it needs more, split it.

**Size test**: Can you complete this todo by editing one file or running one command? If not, it's too big.

## Task Management
- One in_progress at a time. Complete it before starting the next.
- Mark completed immediately after finishing each item.
- Skip this tool for single trivial tasks (one-step, obvious action).`
