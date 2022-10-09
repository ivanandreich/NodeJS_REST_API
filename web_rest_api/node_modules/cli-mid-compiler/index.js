var compile = require('cli-compiler');

module.exports = function compiler(config) {
  var conf = this.configure();
  config = config || conf.compiler;
  // morph legacy configuration
  if(!config && conf.load) {
    config = {};
    config.input = [conf.load.file];
    config.definition = conf.load.options;
    config.cache = conf.load.cache;
    if(conf.substitute && conf.substitute.enabled !== undefined) {
      config.replace = conf.substitute.enabled;
      config.escaping = conf.substitute.escaping;
    }
  }
  if(!config) return this;
  var scope = this;
  config.program = this;
  return function compiler(req, next) {
    // allow disabling once in the chain
    // interactive console programs will likely want
    // to do this
    if(config.enabled === false) return next();
    compile(config, function(err, creq) {
      if(err) return next(err);
      scope.emit('load', req, creq);
      next();
    });
  }
}
