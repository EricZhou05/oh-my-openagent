const fs = require('fs');

function replaceInFile(file, replaces) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  replaces.forEach(r => {
    content = content.replace(r[0], r[1]);
  });
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}

replaceInFile('src/agents/hephaestus/gpt-5-4.ts', [
  ['1. TASK:', '1. 任务 (TASK):'],
  ['2. EXPECTED OUTCOME:', '2. 预期结果 (EXPECTED OUTCOME):'],
  ['3. REQUIRED TOOLS:', '3. 必须使用的工具 (REQUIRED TOOLS):'],
  ['4. MUST DO:', '4. 必须做 (MUST DO):'],
  ['5. MUST NOT DO:', '5. 绝不能做 (MUST NOT DO):'],
  ['6. CONTEXT:', '6. 上下文 (CONTEXT):']
]);

replaceInFile('src/agents/sisyphus/gpt-5-5.ts', [
  ['1. **TASK**:', '1. **任务 (TASK)**:'],
  ['2. **EXPECTED OUTCOME**:', '2. **预期结果 (EXPECTED OUTCOME)**:'],
  ['3. **REQUIRED TOOLS**:', '3. **必须使用的工具 (REQUIRED TOOLS)**:'],
  ['4. **MUST DO**:', '4. **必须做 (MUST DO)**:'],
  ['5. **MUST NOT DO**:', '5. **绝不能做 (MUST NOT DO)**:'],
  ['6. **CONTEXT**:', '6. **上下文 (CONTEXT)**:']
]);

replaceInFile('src/hooks/atlas/system-reminder-templates.ts', [
  ['TASK / EXPECTED OUTCOME / REQUIRED TOOLS / MUST DO / MUST NOT DO / CONTEXT', '任务 (TASK) / 预期结果 (EXPECTED OUTCOME) / 必须使用的工具 (REQUIRED TOOLS) / 必须做 (MUST DO) / 绝不能做 (MUST NOT DO) / 上下文 (CONTEXT)']
]);

