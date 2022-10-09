/**
 *  Find an option defined at the program level or
 *  as assigned to a top-level command.
 *
 *  Should be invoked in the scope of the program
 *  or a command.
 *
 *  Returns the option definition or null.
 *
 *  @param key The option key.
 */
// TODO: make this truly recursive
module.exports = function findOption(key) {
  if(this._options[key]) return this._options[key];
  var cmds = this.commands(), z, cmd, opts;
  for(z in cmds) {
    cmd = cmds[z];
    opts = cmd.options();
    if(opts[key]) return opts[key];
  }
  return null;
}

