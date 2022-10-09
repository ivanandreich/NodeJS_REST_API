var util = require('util'), config = {};

/**
 *  An error class with support for message parameter
 *  replacement and exit status codes.
 *
 *  @param message The error message or error instance.
 *  @param code An exit status code.
 *  @param parameters Array of message replacement parameters.
 *  @param name A specific name for the error.
 */
var CliError = function(message, code, parameters, name) {
  var source = (message instanceof Error) ? message : null;
  var msg = (message instanceof Error)
    ? (message.message || '').replace(/\s+$/, '') : message;
  Error.call(this);
  this.name = name || config.name || 'CliError';
  this.message = msg;
  this.code = typeof(code) === 'number' ? code : 1;
  this.parameters = parameters || [];
  if(source) {
    source.code = this.code;
    source.parameters = this.parameters;
    //console.error(source.stack);
  }
  this._source = source;
  this._key = null;
  //console.dir(source.stack);
  this.getStack(source);
}

util.inherits(CliError, Error);

CliError.prototype.getStack = function(source) {
  source = source || this;
  var prepare = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack) {
    return stack;
  }
  //console.dir('' + source.stack);
  var estack = source.stack;
  Error.captureStackTrace(source, this.constructor);
  this.__stack = estack ? estack : this.stack;
  Error.prepareStackTrace = prepare;
  this.update();
}

/**
 *  Get an error wrapped by this error that is deemed
 *  to be the cause of this error.
 *
 *  @return An error that caused this error or null.
 */
CliError.prototype.cause = function(e) {
  if(!arguments.length) return this._source;
  this._source = e;
  if(e) {
    this.getStack(e);
  }
}

/**
 *  Remove the first element from the raw stack trace
 *  information and update the underlying data.
 */
CliError.prototype.shift = function() {
  var val = this.__stack.shift();
  this.update();
  return val;
}

/**
 *  Remove the last element from the raw stack trace
 *  information and update the underlying data.
 */
CliError.prototype.pop = function() {
  var val = this.__stack.pop();
  this.update();
  return val;
}

/**
 *  Get an array of stack trace lines.
 */
CliError.prototype.toStackArray = function() {
  if(!Array.isArray(this.__stack)) {
    var src = this.cause() && this.cause().stack
      ? this.cause().stack : (this.stack || '');

    src = src.replace(/\n+/g, '\n');
    var stack = src.split('\n');
    if(this.cause() && this.cause().stack) {
      stack = stack.slice(1);
    }
    stack = stack.map(function(line) {
      return (line || '').replace(/^\s+/, '');
    })
    return stack;
  }
  return this.__stack.map(function(callsite) {
    return '' + callsite;
  })
}


/**
 *  Splice the raw stack trace and update the underlying data.
 *
 *  Does not allow inserting elements.
 *
 *  @param index The start index.
 *  @param amount The number of elements to delete.
 */
CliError.prototype.splice = function(index, amount) {
  var val = this.__stack.splice.apply(
    this.__stack, [].slice.call(arguments, 0, 2));
  this.update();
  return val;
}

/**
 *  Update the underlying stacktrace information.
 *
 *  @api private
 */
CliError.prototype.update = function() {
  // NOTE: some errors with some versions of node
  // NOTE: ie, RangeError: Maximum call stack exceeded
  // NOTE: do not have a stack trace
  if(!this.__stack) return;
  var params = this.parameters.slice(0);
  params.unshift(this.message);
  var strace = this._stacktrace = [];
  //var callers = [];
  var stack = this.name + ': '
    + util.format.apply(util, params) + '\n';
  // TODO: FIX
  if(Array.isArray(this.__stack)) {
    this.__stack.forEach(function(caller) {
      //callers.push(caller);
      strace.push('' + caller);
      stack += config.pad + caller + '\n';
    });
  }
  this.stack = (stack || this.stack).trim();
}

/**
 *  Get the error key.
 */
CliError.prototype.__defineGetter__('key', function() {
  return this._key;
});

/**
 *  Set the error key.
 */
CliError.prototype.__defineSetter__('key', function(key) {
  if(this._source) {
    this._source.key = key;
  }
  this._key = key;
});

/**
 *  Get the raw stack trace information.
 */
Object.defineProperty(CliError.prototype, 'info', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function() {
    return this.__stack;
  }
});

/**
 *  Get a source error if this error wraps another error.
 */
Object.defineProperty(CliError.prototype, 'source', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function() {
    return this._source;
  }
});

/**
 *  Get an array of the stack trace lines.
 */
Object.defineProperty(CliError.prototype, 'stacktrace', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function() {
    return this.__stacktrace;
  }
});

/**
 *  Print a warning message from the contents
 *  of this error.
 *
 *  @api private
 *
 *  @param method The console method.
 *  @param trace Whether to include the stack trace.
 *  @param parameters Message replacement parameters.
 */
CliError.prototype.print = function(method, trace, parameters) {
  var msg = this.message, prefix = config.prefix;
  if(prefix === true) {
    msg = this.name + ': ' + msg;
  }else if(typeof prefix == 'string') {
    msg = prefix + msg;
  }else if(typeof prefix == 'function') {
    msg = prefix() + msg;
  }
  parameters = parameters.length ? parameters : this.parameters;
  parameters = parameters.slice();
  parameters.unshift(msg);
  method.apply(console, parameters);
}

/**
 *  Print the stack strace.
 *
 *  @api private
 *
 *  @param method The method to invoke.
 *  @param scope A scope for the method.
 */
CliError.prototype.printstack = function(method, scope) {
  // NOTE: some errors with some versions of node
  // NOTE: ie, RangeError: Maximum call stack exceeded
  // NOTE: do not have a stack trace
  if(!this._stacktrace) return;
  for(var i = 0;i < this._stacktrace.length;i++) {
    method.call(scope, config.pad + this._stacktrace[i]);
  }
}

/**
 *  Print a warning message from the contents
 *  of this error.
 *
 *  @param trace Whether to include the stack trace.
 *  @param ... Message replacement parameters.
 */
CliError.prototype.warn = function(trace) {
  this.print(console.warn, trace, [].slice.call(arguments, 1));
  if(trace) {
    this.printstack(console.warn);
  }
}

/**
 *  Print an error message from the contents
 *  of this error.
 *
 *  @param trace Whether to include the stack trace.
 *  @param ... Message replacement parameters.
 */
CliError.prototype.error = function(trace) {
  this.print(console.error, trace, [].slice.call(arguments, 1));
  if(trace) {
    this.printstack(console.error);
  }
}

/**
 *  Retrieve a formatted string of the error message.
 *
 *  @param ... Message replacement parameters.
 */
CliError.prototype.format = function() {
  var args = [].slice.call(arguments, 0);
  if(!args.length) {
    args = this.parameters;
  }
  args.unshift(this.message);
  return util.format.apply(util, args);
}

/**
 *  Retrieve an object suitable for JSON serialization.
 *
 *  @param trace Whether to include the stack trace.
 *  @param ... Message replacement parameters.
 */
CliError.prototype.toObject = function(trace) {
  var o = {};
  var stack = this._stacktrace;
  var msg = this.message;
  var parameters = [].slice.call(arguments, 1);
  if(!parameters.length && this.parameters.length) {
    parameters = this.parameters.slice(0);
  }
  if(parameters.length) {
    parameters.unshift(msg);
    msg = util.format.apply(util, parameters);
  }
  o.message = msg;
  o.name = this.name;
  o.code = this.code;
  if(this.key) {
    o.key = this.key;
  }
  if(trace) {
    o.stack = stack;
  }
  return o;
}

/**
 *  Returns a JSON string representation of this error.
 *
 *  @param trace Whether to include the stack trace.
 *  @param ... Message replacement parameters.
 */
CliError.prototype.stringify = function(trace) {
  var o = this.toObject.apply(this, arguments);
  return JSON.stringify(o);
}

/**
 *  Exit the process with the status code
 *  associated with this error.
 */
CliError.prototype.exit = function() {
  process.exit(this.code);
  return this.code;
}

module.exports = function(conf) {
  config = conf;
  return module.exports;
}

module.exports.CliError = CliError;
