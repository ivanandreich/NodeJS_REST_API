var fs = require('fs')
  , util = require('util')
  , define = require('cli-util').define
  , logger = require('cli-logger');

var defaults = {
  level: {
    name: '--log-level [level]',
    description: 'set the log level',
    key: 'logLevel',
    callback: function level(req, arg, value) {
      var level = parseInt(value);
      if(!isNaN(level)) {
        value = level;
      }
      try {
        this.log.level(value);
      }catch(e) {
        this.raise(this.errors.EUNKNOWN_LOG_LEVEL, [value], e);
      }
    }
  },
  file: {
    name: '--log-file [file]',
    description: 'redirect to log file',
    key: 'logFile',
    callback: function file(req, arg, value) {
      var logger = require('cli-logger'), scope = this;
      var streams = this.log.streams, stream;
      stream = fs.createWriteStream(value, {flags: 'a'});
      stream.once('error', function(e) {
        scope.raise(scope.errors.ELOG_FILE, [value], e);
      })
      for(var i = 0;i < streams.length;i++) {
        streams[i].stream = stream;
        streams[i].type = logger.FILE;
      }
    }
  }
}

var keys = Object.keys(defaults);

var callbacks = {};
keys.forEach(function(key) {
  callbacks[defaults[key].key] = defaults[key].callback;
})

function configure(options) {
  var i, key;

  function handler(req, arg, value) {
    callbacks[arg.key()].call(this, req, arg, value);
  }

  for(i = 0;i < keys.length;i++) {
    key = keys[i];
    if(options[key] && typeof(options[key]) === 'object'
      && !Array.isArray(options[key])) {
        options[key].name = options[key].name || defaults[key].name;
        options[key].description = options[key].description
          || defaults[key].description;
        this.option(options[key]);
        this.once(defaults[key].key, handler);
    }
  }
}

/**
 *  Decorates the program with a logger assigned to the log
 *  property of the program.
 *
 *  @param conf A configuration to pass when initializing
 *  the logger module.
 *  @param options An object defining common log options.
 */
module.exports = function(conf, options) {
  conf = conf || this.configure().log || {};

  if(!this.configure().log) {
    this.configure().log = conf;
  }

  var scope = this;
  var bitwise = conf && conf.bitwise !== undefined ? conf.bitwise : false;
  if(conf && conf.bitwise) {
    delete conf.bitwise;
  }
  var log = logger(conf, bitwise);

  var ttycolor;
  try {
    ttycolor = require('ttycolor');
  }catch(e) {}
  if(conf.colors !== false && ttycolor) {

    var ansi = ttycolor.ansi;

    //console.log(ansi.color);

    // prefer a console stream if colors are enabled
    // and the logger has not been configured with custom streams
    if(log.isDefault()) {
      log.useConsoleStream();

      // prefer a default prefix that styles differently
      log.conf.prefix = (conf.prefix !== undefined) ? conf.prefix :
        function(record, tty) {
          var symbol = (conf.symbol || '⚡')
            , fmt = conf.format || '%s ' + symbol
            , nm = scope.name();

          if(!tty) {
            return util.format(fmt, nm);
          }
          //console.log(
            //'default color prefixer %s',
            //ansi(util.format(fmt, nm)).normal.bg.black);
          //return ansi(util.format(fmt, nm)).normal.bg.black;
          var c = ansi(nm).normal.valueOf(tty) + 
            ansi(' ' + symbol).normal.cyan.valueOf(tty);
          //console.log('is instance %s', c instanceof ansi.color);
          //console.dir(c);
          return c;
        };
    }
  }else{
    conf.prefix = conf.prefix !== undefined ? conf.prefix : function(/*record*/) {
      var fmt = conf.format || '%s ' + (conf.symbol || '⚡')
        , nm = scope.name();
      return util.format(fmt, nm);
    };
  }
  define(this, 'log', log, false);
  if(options) {
    configure.call(this, options);
  }
  return this;
};
