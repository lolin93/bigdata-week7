import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const files=['data.js','engine.js','sync.js','room.js','app.js'];
const pieces=files.map(file=>readFileSync(new URL(file,import.meta.url),'utf8')
  .replace(/^import .*? from '\.\/[^']+';\r?\n/gm,'')
  .replace(/^export (const|function) /gm,'$1 '));
const game=`// Generated from data.js, engine.js, sync.js, room.js and app.js. Run node build.mjs after source edits.\n'use strict';\n${pieces.join('\n\n')}`;
writeFileSync(new URL('game.js',import.meta.url),game);
// index.html asks for game.js and styles.css by content version, so a phone never pairs a new page with an old cached
// script; the footer shows the same version so players can check they have the latest one.
const version=createHash('sha256').update(game).update(readFileSync(new URL('styles.css',import.meta.url))).digest('hex').slice(0,8);
const index=new URL('index.html',import.meta.url);
writeFileSync(index,readFileSync(index,'utf8')
  .replace(/(href="\.\/styles\.css)(\?v=\w+)?"/,`$1?v=${version}"`)
  .replace(/(src="\.\/game\.js)(\?v=\w+)?"/,`$1?v=${version}"`)
  .replace(/(<span id="app-version">)[^<]*(<\/span>)/,`$1版本 ${version}$2`));
console.log(`Built game.js (version ${version}) for direct opening of index.html.`);
