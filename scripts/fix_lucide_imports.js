const fs = require('fs');
const path = require('path');

const integrationsDir = path.join(process.cwd(), 'src', 'nodes', 'integrations');

function getFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));
}

const files = getFiles(integrationsDir);
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  // Match import { ... } from 'lucide-react' (supports double or single quotes)
  content = content.replace(/import\s*\{([^}]+)\}\s*from\s*['\"]lucide-react['\"];?/g, (m, group) => {
    const items = group.split(',').map(s => s.trim()).filter(Boolean);
    const unique = [...new Set(items)];
    return `import { ${unique.join(', ')} } from 'lucide-react';`;
  });

  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('Fixed:', file);
  }
});
console.log(`Done. Files changed: ${changed}`);
