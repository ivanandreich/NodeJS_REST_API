var defmerge = require('./merge');

function walk(program, map, def) {
  var k, v;
  for(k in def) {
    v = def[k];
    if(v && map[k]) {
      defmerge(map[k], k, def[k]);

      if(map[k] && map[k].isCommand()) {
        if(def[k].options) {
          walk(map[k], map[k].options(), def[k].options);
        }
        if(def[k].commands) {
          walk(map[k], map[k].commands(), def[k].commands);
        }
      }
    }
  }
}

/**
 *  Join a program with source command and option definitions.
 *
 *  Sources are javascript files that define functions for
 *  the action and converter fields.
 */
function join(program, opts, cb) {
  var sources = opts.sources
    , def = opts.def
    , opts = def.options
    , cmds = def.commands;
  if(sources) {
    try {
      if(sources.options) opts = require(sources.options);
      if(sources.commands) cmds = require(sources.commands);
    }catch(e) {
      return cb(e);
    }
  }

  walk(program, program.options(), opts);
  walk(program, program.commands(), cmds);
  cb(null, program);
}

module.exports = join;
