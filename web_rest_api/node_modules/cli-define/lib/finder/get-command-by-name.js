/**
 *  Utility to determine is an argument value corresponds
 *  to a known command name (alias).
 *
 *  @param cmd The argument string.
 *  @param commands The list of known commands.
 */
module.exports = function getCommandByName(cmd, commands, opts) {
  opts = opts || {};

  var z, arg, k, v;
  for(z in commands) {
    arg = commands[z];
    if(~arg.names().indexOf(cmd)) {
      return arg;
    }
  }

  // recurse after testing top-level
  if(opts.recurse) {
    for(z in commands) {
      arg = commands[z];
      if(Object.keys(arg.commands()).length) {
        v = getCommandByName(cmd, arg.commands(), opts);
        if(v) {
          return v;
        }
      }
    }
  }
}
