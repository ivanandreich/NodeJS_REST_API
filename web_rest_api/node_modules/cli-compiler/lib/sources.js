var async =  require('async')
  , fs = require('fs')
  , CompilerError = require('./compiler-error');

function sources(req, next) {
  var opts = req.argv
    , program = req.program
    , def = opts.def
    , sources = opts.sources;

  var options = sources.options;
  var commands = sources.commands;
  var configure = sources.configure;

  var src = [];
  if(configure) src.push({key: 'configure', file: configure});
  if(options) src.push({key: 'options', file: options});
  if(commands) src.push({key: 'commands', file: commands});

  req.sources = {};

  function include(item, cb) {
    var key = item.key
      , file = item.file
      , datum;
    try {
      datum = {
        file: require.resolve(file),
        code: require(file)
      }
      def[key] = datum.code;
      req.sources[key] = datum;
    }catch(e) {
      return next(e);
    }

    fs.readFile(file, function(err, data) {
      if(err) return cb(err);
      datum.data = data;
      //console.dir(datum);
      cb();
    })
  }

  async.each(src, function iterator(item, cb) {
    include(item, cb);
  }, function(err) {
    next(err);
  })
}

module.exports = sources;
