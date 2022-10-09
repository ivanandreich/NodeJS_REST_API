var replacer = require('./util/replacer');

function see(req, program) {
  var subs = req.environment;
  var list = program.finder.getCommandList(null, {max: 1});
  list = list.sort(function(a, b) {
    a = a.key(), b = b.key();
    if(a > b) {
      return 1;
    }else if(a < b) {
      return -1;
    }
    return 0;
  })

  var i, cmd, nm, val, prefix = 'see_', suffix = '(1)', all = [];
  for(i = 0;i < list.length;i++) {
    cmd = list[i];
    nm = prefix + cmd.getFullName('_', true, true, true);
    val = cmd.getFullName(null, true, true, false) + suffix;
    subs[nm] = val;
    all.push(val);
  }

  // join the lot together for SEE man sections
  subs.see_all = all.join(', ');
}

/**
 *  Replace variables in program strings.
 */
function replace(req, next) {
  var opts = req.argv
    , program = req.program;

  // variable replacement disabled
  if(opts.replace === false) return next();

  // decorate the environment replacement
  // variables with see_ variables
  if(opts.see !== false) {
    see(req, program);
  }

  // perform replacement
  replacer.call(
    program, req.environment,
    opts.escaping !== undefined ? opts.escaping : true);

  next();
}

module.exports = replace;
