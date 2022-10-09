var assert = require('assert');
var fs = require('fs');
var path = require('path'),
  basename = path.basename,
  dirname = path.dirname;
var Writable = require('stream').Writable;
var util = require('util');

var config = {
  name: basename(process.argv[1]),
  start: 64,
  prefix: true,
  lang: 'en',
  pad: '  ',
  log: null,
  flags: null,
  locales: path.join(path.normalize(dirname(process.argv[1])), 'locales'),
  lc: ['LC_ALL', 'LC_MESSAGES']
}
var cache = {}, stream;
var errors = {};
var ErrorDefinition = require('./lib/definition');
var CliError = require('./lib/error')(config).CliError;
var lc = require('cli-locale');

/**
 *  Raise an error.
 *
 *  @param err The error definition.
 *  @param ... Message replacement parameters.
 */
function raise(err) {
  var parameters = [].slice.call(arguments, 1);
  assert(err instanceof ErrorDefinition,
    'argument to raise must be error definition');
  var e = err.toError();
  var listeners = process.listeners('uncaughtException');
  if(!listeners.length) {
    process.once('uncaughtException', function(err) {
      parameters.unshift(false);
      e.source = err;
      e.error.apply(e, parameters);
      // NOTE: this is only really required to mock
      // NOTE: this method invocation in test, see test/unit/exit.js
      process.emit('exception', e);
      e.exit();
    });
  }else{
    e.message = e.format.apply(e, parameters);
  }
  throw e;
}

/**
 *  Print a warning from an error definition.
 *
 *  @param err The error definition.
 *  @param trace Whether to include the stack trace.
 *  @param ... Message replacement parameters.
 */
function warn(err, trace) {
  assert((err instanceof ErrorDefinition),
    'argument to warn must be error definition');
  var e = err.toError();
  // remove this method from the stack trace
  e.stacktrace.shift();
  var parameters = [].slice.call(arguments, 2);
  parameters.unshift(trace);
  e.warn.apply(e, parameters);
  return e;
}


/**
 *  Exit the program from an error definition.
 *
 *  @param err The error definition.
 *  @param trace Whether to include the stack trace.
 *  @param ... Message replacement parameters.
 */
function exit(err, trace) {
  assert(err instanceof ErrorDefinition,
    'argument to exit must be error definition');
  var e = err.toError();
  // remove this method from the stack trace
  e.stacktrace.shift();
  var parameters = [].slice.call(arguments, 2);
  parameters.unshift(trace);
  e.error.apply(e, parameters);
  return e.exit();
}

/**
 *  Import definitions from an object.
 *
 *  @param source An array defining error messages.
 */
function load(source) {
  assert(Array.isArray(source), 'argument to load must be an array');
  var i, v, d;
  for(i = 0;i < source.length;i++) {
    v = source[i];
    assert(typeof v.key == 'string', 'error definition must have string key')
    d = define(v.key, v.message, v.parameters, v.code);
    if(v.description) d.description = v.description;
  }
}

/**
 *  Clear all defined errors.
 */
function clear() {
  // NOTE: we clear this way so that modules
  // NOTE: that reference the errors do not
  // NOTE: have their references broken after clear()
  for(var z in errors) {
    delete errors[z];
  }
  return errors;
}

/**
 *  Define an error for the program.
 *
 *  If the exit status code is not specified it is auto
 *  incremented based on the previously defined errors.
 *
 *  @param key The error key.
 *  @param message The error message.
 *  @param parameters Array of message replacement parameters (optional).
 *  @param code Exit status code (optional).
 */
function define(key, message, parameters, code) {
  if(typeof parameters == 'number') {
    code = parameters;
    parameters = null;
  }
  var start = typeof config.start == 'number' ? config.start : 128;
  if(!code && errors[key] && errors[key].code) {
    code = errors[key].code;
  }
  if(code === undefined) code = Object.keys(errors).length + start;
  // NOTE: we have to clamp code to 255 limit as POSIX systems
  // NOTE: use an unsigned 8-bit integer, if you process.exit(256)
  // NOTE: in node it will exit with a zero exit code which
  // NOTE: is completely undesirable
  if(code > 255) code = 255;
  // re-use error code if overwriting
  var err = new ErrorDefinition(key, message, code, parameters);
  errors[key] = err;
  return err;
}

var file = require('./lib/file')(config, errors, load).file;

/**
 *  Open a log file write stream and overwrite the error
 *  and warn console methods to write to the log file.
 */
function open(log, flags) {
  log = log || config.log;
  if(!log || typeof log !== 'string' && typeof log.write !== 'function') {
    throw new TypeError('Cannot open log file, invalid argument');
  }
  flags = flags || config.flags || 'a';
  stream = (typeof log === 'string')
    ? fs.createWriteStream(log, {flags: flags})
    : log;
  cache.error = console.error;
  cache.warn = console.warn;
  console.error = function() {
    var msg = util.format.apply(util, arguments) + '\n';
    stream.write(msg);
  }
  console.warn = function() {
    var msg = util.format.apply(util, arguments) + '\n';
    stream.write(msg);
  }
  return stream;
}

/**
 *  Close a log file stream.
 */
function close() {
  if(!stream) {
    throw new Error('Log file stream is not open');
  }
  console.error = cache.error;
  console.warn = cache.warn;
  stream.end();
  stream = null;
  cache = {};
}

module.exports = function configure(conf) {
  for(var z in conf) {
    config[z] = conf[z];
  }
  lc.language = config.lang;
  if(config.log) {
    open();
  }
  return module.exports;
}

module.exports.clear = clear;
module.exports.config = config;
module.exports.define = define;
module.exports.ErrorDefinition = ErrorDefinition;
module.exports.CliError = CliError;
module.exports.errors = errors;
module.exports.exit = exit;
module.exports.file = file;
module.exports.load = load;
module.exports.raise = raise;
module.exports.warn = warn;
module.exports.open = open;
module.exports.close = close;
