const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/agents');
let updatedCount = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('1. TASK: Atomic')) {
    content = content
      .replace('1. TASK: Atomic, specific goal', '1. 任务 (TASK): Atomic, specific goal')
      .replace('2. EXPECTED OUTCOME: Concrete deliverables', '2. 预期结果 (EXPECTED OUTCOME): Concrete deliverables')
      .replace('3. REQUIRED TOOLS: Explicit tool whitelist', '3. 必须使用的工具 (REQUIRED TOOLS): Explicit tool whitelist')
      .replace('4. MUST DO: Exhaustive requirements', '4. 必须做 (MUST DO): Exhaustive requirements')
      .replace('5. MUST NOT DO: Forbidden actions', '5. 绝不能做 (MUST NOT DO): Forbidden actions')
      .replace('6. CONTEXT: File paths, existing patterns', '6. 上下文 (CONTEXT): File paths, existing patterns');
    fs.writeFileSync(f, content, 'utf8');
    updatedCount++;
    console.log('Updated ' + f);
  }
});

console.log(`Total files updated: ${updatedCount}`);
