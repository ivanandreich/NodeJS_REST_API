var CompilerError = require('./compiler-error');

function libs(req, next) {
  var opts = req.argv
    , program = req.program
    , libs = opts.libs
    , mod;

  //console.log('load libs');

  libs.forEach(function(lib) {
    try {
      mod = require(lib)
    }catch(e) {
      return next(e);
    }
    if(typeof mod !== 'function') {
      return next(
        new CompilerError(
          'invalid library %s, does not export a function', [lib]));
    }

    // bind to the program scope
    mod = mod.bind(program);

    // execute library function
    // may add options, commands or alter the program
    // in any way
    mod();
  })
  next();
}

module.exports = libs;
