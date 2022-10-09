/**
 *  Utility to walk a program and fetch all commands into an array.
 *
 *  Should be invoked in the scope of the program or a command.
 *
 *  @param cli The program or command.
 *  @param opts Processing options.
 *  @param opts.max Maximum depth to descend.
 */
module.exports = function getCommandList(cli, opts, list, depth) {
  cli = cli || this;
  opts = opts || {};
  list = list || [];
  depth = depth !== undefined ? depth : 1;
  var cmds = cli.commands() || {}, z, arg;
  for(z in cmds) {
    arg = cmds[z];
    list.push(arg);
    if(!opts.max) {
      commands(arg, opts, list, ++depth);
    }else if(opts.max && depth < opts.max) {
      commands(arg, opts, list, ++depth);
      --depth;
    }
  }
  return list;
}
