import {readFileSync,writeFileSync} from 'node:fs';

// 依相依順序串接；所有來源仍保持 ESM，可被瀏覽器模組或測試直接匯入。
const files=[
  'data.js',
  'party_data.js',
  'engine.js',
  'party_engine.js',
  'sync.js',
  'net.js',
  'audio_system.js',
  'ui_party.js',
  'app.js'
];
const stripModuleSyntax=source=>source
  // 多行 / 單行 import（含 side-effect import）
  .replace(/^import[\s\S]*?from\s+'\.\/[^']+';\r?\n/gm,'')
  .replace(/^import\s+'\.\/[^']+';\r?\n/gm,'')
  // export 宣告
  .replace(/^export\s+(?=(?:const|let|var|function|class)\b)/gm,'');
const pieces=files.map(file=>stripModuleSyntax(readFileSync(new URL(file,import.meta.url),'utf8')));
writeFileSync(
  new URL('game.js',import.meta.url),
  `// Generated from ${files.join(', ')}. Run node build.mjs (or build.ps1) after source edits.\n'use strict';\n${pieces.join('\n\n')}`
);
console.log(`Built game.js from ${files.length} source files for direct opening of index.html.`);
