var middleware = require('cli-middleware')
  , print = require('./print')
  , CompilerError = require('./compiler-error');

var list = [
  require('./create'),
  require('./cache'),
  require('./libs'),
  require('./sources'),
  require('./cat'),
  require('./parse'),
  require('./render'),
  require('./replace'),
  require('./transform'),
  require('./write'),
]

function compile(opts, cb) {
  opts = opts || {};

  // library module function to invoke in the scope of the program
  opts.libs = opts.libs || [];

  // source paths for option and command definitions to merge
  opts.sources = opts.sources || {};

  // definitions to merge with the parsed program data
  opts.def = opts.definition || {};

  opts.input = Array.isArray(opts.input) ? opts.input
    : opts.input ? [opts.input] : null;

  if(!opts.input || !opts.input.length) {
    return cb(new CompilerError('no input files specified'));
  }

  var midopts = {list: list, bail: true}
    , runner = middleware(midopts)
    , req = {};

  //var start = process.hrtime();

  runner(opts, req, function oncomplete(err, req) {
    if(err) return cb(err);

    //var diff = process.hrtime(start);
    //console.log('compilation took %d microseconds',
      //(diff[0] * 1e9 + diff[1]) / 1000);

    print(req, function(err) {
      cb(err, req);
    });
  });
}

module.exports = compile;
