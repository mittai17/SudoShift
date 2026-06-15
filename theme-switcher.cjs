const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  ['bg-white', 'bg-[#13141c]'],
  ['bg-[#f8fafc]', 'bg-[#0d0e15]'],
  ['bg-gray-50', 'bg-[#1a1b23]'],
  ['bg-slate-50', 'bg-[#1a1b23]'],
  ['bg-slate-100', 'bg-[#2a2b36]'],
  ['bg-[#EEF2FF]', 'bg-emerald-500/10'],
  
  // Borders
  ['border-gray-200', 'border-[#2a2b36]'],
  ['border-slate-100', 'border-[#2a2b36]'],
  ['border-slate-200', 'border-[#2a2b36]'],
  ['border-gray-300', 'border-[#3f3f46]'],
  ['border-indigo-500', 'border-emerald-500/50'],
  ['border-[#6366f1]', 'border-emerald-500/50'],
  
  // Text Colors
  ['text-gray-900', 'text-gray-100'],
  ['text-slate-900', 'text-gray-100'],
  ['text-slate-800', 'text-gray-200'],
  ['text-gray-700', 'text-gray-300'],
  ['text-slate-700', 'text-gray-300'],
  ['text-gray-600', 'text-gray-400'],
  ['text-slate-600', 'text-gray-400'],
  ['text-slate-400', 'text-gray-500'],
  ['text-indigo-600', 'text-emerald-500'],
  ['text-[#6366f1]', 'text-emerald-500'],
  
  // Highlights / Background Accents
  ['bg-[#6366f1]', 'bg-emerald-600'],
  ['bg-indigo-600', 'bg-emerald-600'],
  ['hover:bg-indigo-700', 'hover:bg-emerald-700'],
  ['bg-indigo-50', 'bg-emerald-500/10'],
  ['hover:bg-indigo-50', 'hover:bg-emerald-500/10'],
  ['hover:bg-indigo-100', 'hover:bg-emerald-500/20'],
  ['hover:text-indigo-600', 'hover:text-emerald-400'],
  ['focus:ring-indigo-100', 'focus:ring-emerald-900/50'],
  ['selection:bg-[#6366f1]', 'selection:bg-emerald-600'],
  ['group-hover:text-indigo-600', 'group-hover:text-emerald-400'],
  ['group-hover:text-indigo-500', 'group-hover:text-emerald-400'],
  ['hover:text-indigo-300', 'hover:text-emerald-400'],
  ['hover:border-indigo-500/40', 'hover:border-emerald-500/40'],
  ['bg-indigo-500/10', 'bg-emerald-500/10'],
  ['border-indigo-500/20', 'border-emerald-500/20'],
  ['text-indigo-400', 'text-emerald-400'],
  ['text-indigo-300', 'text-emerald-400'],
  ['text-indigo-500', 'text-emerald-500']
];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [search, replace] of replacements) {
        const regex = new RegExp(escapeRegExp(search), 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory('d:/SudoShift/src/pages');
processDirectory('d:/SudoShift/src/components');
processDirectory('d:/SudoShift/src/auth');

console.log('Theme replacement complete.');
