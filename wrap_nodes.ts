import fs from 'fs';
import path from 'path';

const nodesDir = path.join(process.cwd(), 'src/components/nodes');
const files = fs.readdirSync(nodesDir);

files.forEach(file => {
  if (file.endsWith('Node.tsx') && file !== 'NodeWrapper.tsx') {
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('NodeWrapper')) return;

    // Add import statement at top, after other imports or as first line
    const importMatch = content.match(/import .*?;/g);
    const lastImport = importMatch ? importMatch[importMatch.length - 1] : null;
    
    if (lastImport) {
        content = content.replace(lastImport, lastImport + '\nimport NodeWrapper from \'./NodeWrapper\';');
    } else {
        content = 'import NodeWrapper from \'./NodeWrapper\';\n' + content;
    }

    // Now wrap the return statement
    // The main challenge is finding the return statement of the component.
    // It's mostly something like "return (\n    <div...."
    const returnRegex = /return \s*\(\s*(<div[^]*)\);\s*\}/s;
    const match = content.match(returnRegex);
    
    if (match && match[1]) {
       const innerContent = match[1];
       content = content.replace(returnRegex, `return (\n    <NodeWrapper>\n      ${innerContent}\n    </NodeWrapper>\n  );\n}`);
       fs.writeFileSync(filePath, content);
       console.log(`Updated ${file}`);
    } else {
       console.log(`Could not update ${file}`);
    }
  }
});
