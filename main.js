'use strict';

const Fs = require('fire-fs');
const Path = require('fire-path');

const REGX_GETSYSTEMINFOSYNC = /(\w+)\s*=\s*wx\.getSystemInfoSync/;
const REGX_OSVERSION = /(\w+\.osVersion\s*=\s*)(\w+)\[0\]/;

const VERSIONS = ['1.8.2', '1.9.1', '1.9.2', '1.9.3', '1.10.1', '1.10.2'];

function ReplaceOsVersion (opts, cb) {

  if (opts.platform !== 'wechatgame' || Editor.versions.cocos2d.startsWith('2.')) {
    return cb();
  }

  if (VERSIONS.indexOf(Editor.versions.cocos2d) === -1) {
    Editor.log(`该 system-version-fix 插件只于 Cocos Creator 版本: ${VERSIONS.join('|')} 验证过，其他版本不保证能正常生效，请自行验证。`);
  }

  Editor.log('Start fix system-version');

  let engine_path = Path.join(opts.dest, opts.debug ? 'cocos2d-js.js' : 'cocos2d-js-min.js');
  let engine = Fs.readFileSync(engine_path, 'utf8');

  let result = engine.match(REGX_GETSYSTEMINFOSYNC);
  if (!result) {
    Editor.error(`未能匹配到 ${REGX_GETSYSTEMINFOSYNC}`);
    return cb();
  }
  let systemStr = `${result[1]}.system`;
  let found = false;
  engine = engine.replace(REGX_OSVERSION, function (match, lhs, version) {
      found = true;
      return `${lhs}${version} ? ${version}[0] : ${systemStr}`;
  });
  if (!found) {
    Editor.error(`未能匹配到 ${REGX_OSVERSION}`);
    return cb();
  }
  Fs.writeFileSync(engine_path, engine);

  Editor.log('Finish fix system-version');
  return cb();
}

module.exports = {
  load() {
    Editor.Builder.on('build-finished', ReplaceOsVersion);
  },

  unload() {
    Editor.Builder.removeListener('build-finished', ReplaceOsVersion);
  },
};
