import fs from 'fs';
import path from 'path';

const designPath = path.resolve('DESIGN.md');
if (!fs.existsSync(designPath)) {
  console.error('DESIGN.md not found.');
  process.exit(1);
}

const content = fs.readFileSync(designPath, 'utf8');
const fileLineRegex = /`([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+):(\d+)`/g;

let match;
let errors = 0;
let totalChecked = 0;

while ((match = fileLineRegex.exec(content)) !== null) {
  const filePath = match[1];
  const lineNumber = parseInt(match[2], 10);
  totalChecked++;

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ File not found: ${filePath}`);
    errors++;
    continue;
  }

  const lines = fs.readFileSync(resolved, 'utf8').split('\n');
  if (lineNumber < 1 || lineNumber > lines.length) {
    console.error(`❌ Line ${lineNumber} out of bounds in ${filePath} (total lines: ${lines.length})`);
    errors++;
  } else {
    // Verified
  }
}

if (errors > 0) {
  console.error(`Failed: ${errors} file:line references in DESIGN.md were invalid.`);
  process.exit(1);
}

console.log(`✅ All ${totalChecked} file:line references in DESIGN.md verified successfully.`);
process.exit(0);
