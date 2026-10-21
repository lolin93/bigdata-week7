import {readFileSync,writeFileSync} from 'node:fs';

const files=['data.js','engine.js','sync.js','room.js','app.js'];
const pieces=files.map(file=>readFileSync(new URL(file,import.meta.url),'utf8')
  .replace(/^import .*? from '\.\/[^']+';\r?\n/gm,'')
  .replace(/^export (const|function) /gm,'$1 '));
writeFileSync(new URL('game.js',import.meta.url),`// Generated from data.js, engine.js, sync.js, room.js and app.js. Run node build.mjs after source edits.\n'use strict';\n${pieces.join('\n\n')}`);
console.log('Built game.js for direct opening of index.html.');
