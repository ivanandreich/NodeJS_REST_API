var events = require('events')
  , path = require('path')
  , basename = path.basename
  , util = require('util')
  , utils = require('cli-util')
  , camelcase = utils.camelcase
  , define = utils.define

  , EventProxy = require('./lib/event-proxy')
  , Description = require('cli-description')
  , mutators = require('./lib/mutators')
  , helpers = require('./lib/finder');

var k, keys;
var re = {
  delimiter: function(){return /[ ,|]+/;},
  required: function(){return /^=?</;},
  multiple: function(){return /\.\.\./;},
  extra: function(){return /^([^=\[<]*)((=|\[|<).*)/;},
  key: function(){return /^([^:\s]+)(\s+)?:(\s+)?(.*)/;},
  no: function(){return /(\[no-?\]-?)/;}
}

function initialize(options, properties) {
  for(var z in options) {
    if(~properties.indexOf(z) && options[z]) {
      this[z](options[z]);
    }
  }
  if(options.description) this.description(options.description);
  if(options.detail) this.detail(options.detail);
  if(options.action && typeof this.action === 'function') {
    this.action(options.action);
  }
}

function description(description) {
  if(!arguments.length) return this._description;
  if(description && typeof description === 'string') {
    description = new Description(description);
  }
  //console.log('set description %j', description);
  this._description = description;
  return this;
}

function detail(detail) {
  if(!arguments.length) return this._detail;
  if(detail && typeof detail === 'string') {
    detail = new Description(detail);
  }
  //console.log('set detail %j', detail);
  this._detail = detail;
  return this;
}

/**
 *  Retrieve the key for an option.
 *
 *  Scope is the option. Alternatively you may pass a
 *  string of the raw name passed when instantiating the options.
 *
 *  @param names Array of names or raw string name (optional).
 */
function getKey(names, name) {
  var k, prefixed = false;
  names = names || this._names;
  name = name || this._name;
  if(typeof names == 'string') {
    name = names;
    names = names.split(re.delimiter());
  }
  // handle key prefixes, in the form *name: -n, --file-name*
  if(re.key().test(name)) {
    k = name.replace(re.key(), "$1");
    name = this._name = name.replace(re.key(), "$4");
    names = this._names = name.split(re.delimiter());
    //console.log('got new key names %j', names);
    getExtra.call(this);
    prefixed = true;
    //console.log('got key prefix "%s"', k);
    //console.log('got new key name "%s"', name);
    //console.log('got new extra %s', this._extra);
    //console.log('got new key names %j', this._names);
  }
  names = names.slice(0);
  if(this._extra) {
    var j = names.length -1;
    var nm = names[j];
    while(re.extra().test(nm) || re.multiple().test(nm)) {
      // allow for flush extra values
      if(/^-+/.test(nm)) {
        names[j] = nm.replace(re.extra(), "$1");
      }else{
        names.pop();
      }
      nm = names[--j];
    }
    this._names = sortNames(names);
  }
  if(!k) {
    k = names.reduce(
      function (a, b) { return a.length > b.length ? a : b; });
    k = k.replace(/^-+/, '');
  }
  return prefixed ? k : camelcase(k.toLowerCase());
}

function sortNames(names, cmd) {
  return names.sort(function(a, b) {
    if(cmd) return b.length > a.length;
    // sort short options before long options
    var re = /^-[^-]/;
    return re.test(a) ? -1 : re.test(b) ? 1 : 0;
  });
}

/**
 *  Retrieve the extra portion of the option name.
 *
 *  Note this also updates the names array to not include
 *  the extra portion.
 */
function getExtra() {
  if(re.no().test(this._name)) {
    this._extra = false;
    return;
  }
  if(!re.extra().test(this._name)) return;
  this._extra = this._name.replace(re.extra(), "$2");
  //console.log(this._extra);
  var name = this._name.replace(re.extra(), "$1");
  //console.log('name: %s', name);
  this._names = name.split(re.delimiter());
  if(!this._names[this._names.length - 1]) this._names.pop();
  this._names = sortNames(this._names);
}

//var enumerable = process.env.CLI_TOOLKIT_DEBUG ? true : false;

//function define(obj, name, value, writable, enumerate) {
  //writable = writable !== undefined ? writable : false;
  //enumerate = enumerate !== undefined ? enumerate : enumerable;
  //Object.defineProperty(obj, name,
    //{
      //enumerable: enumerate,
      //configurable: false,
      //writable: writable,
      //value: value
    //}
  //);
//}

/**
 *  Abstract super class.
 *
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param options The argument options or conversion function.
 */
function Argument(name, description, options) {
  if(typeof name == 'object') options = name;
  define(this, '_name', name, true);
  define(this, '_description', '', true);
  define(this, '_detail', undefined, true);
  define(this, '_key', '', true);
  define(this, '_optional', true, true);
  define(this, '_multiple', false, true);
  define(this, '_value', undefined, true);
  define(this, '_converter', undefined, true);
  define(this, '_action', undefined, true);
  define(this, '_extra', undefined, true);
  define(this, '_names', undefined, true);

  // event emitter
  define(this, '_emitter', new events.EventEmitter(), false);
  define(this, '_events', undefined, true);
  define(this, '_maxListeners', undefined, true);
  define(this, 'domain', undefined, true);

  // must set description this way to get the plain
  // text and markdown descriptions
  this.description(description || '');

  if(options === JSON) {
    this._converter = JSON;
  }else if(options && (typeof options == 'object') && !Array.isArray(options)) {
    initialize.call(this, options, Object.keys(mutators.arg));
  }else if((typeof options == 'function') || this.isFunctionArray(options)){
    this._converter = options;
    if(arguments.length > 3 && this._value === undefined) {
      this._value = arguments[3];
    }
  }else {
    this._value = options;
    if(arguments.length > 3
      && (typeof(arguments[3]) == 'function'
      || this.isFunctionArray(options))) {
      this._converter = arguments[3];
    }
  }

  if(!this._name || typeof this._name !== 'string') {
    throw new TypeError('Invalid argument name \'' + this._name + '\'');
  }

  // strip no prefixes
  var no = re.no();
  var name = '' + this._name;
  if((this instanceof Flag) && no.test(this._name)) {
    name = this._name.replace(no, '');
  }

  this._names = this._name.split(re.delimiter());
  //console.dir(this._names);
  getExtra.call(this);
  if(re.required().test(this._extra)) {
    this._optional = false;
  }
  if(re.multiple().test(this._extra)) {
    this._multiple = true;
  }
  this._key = getKey.call(this, name);
  //console.log('key', this._key);
}
define(Argument.prototype, 'description', description, false);
define(Argument.prototype, 'detail', detail, false);

for(k in EventProxy) {
  define(Argument.prototype, k, EventProxy[k], false);
}

// declare instanceof tests here so there is no
// chance the instances are different between dependencies
// - eg: module version conflict
function isArgument() {
  return (this instanceof Argument);
}

function isOption() {
  return (this instanceof Option);
}

function isFlag() {
  return (this instanceof Flag);
}

function isCommand() {
  return (this instanceof Command);
}

function isProgram() {
  return (this instanceof Program);
}

var is = {
  isArgument: isArgument,
  isOption: isOption,
  isFlag: isFlag,
  isCommand: isCommand,
  isProgram: isProgram
}

for(k in is) {
  define(Argument.prototype, k, is[k], false);
}

function isFunction(f) {
  return typeof f === 'function';
}

function toObject(opts, depth) {
  opts = opts || {};
  if(depth === undefined) depth = 0;
  var o = {};
  o.constructor = this.constructor;
  o.key = this.key();

  if(opts.name !== false && isFunction(this.name)) {
    o.name = this.name();
  }

  if(opts.version !== false && isFunction(this.version)) {
    // NOTE: do not call version(), CommandProgram will use middleware
    o.version = this._version;
  }

  if(opts.description !== false && isFunction(this.description)) {
    o.description = this.description();
  }

  if(opts.detail !== false && isFunction(this.detail)) {
    o.detail = this.detail();
  }

  if((opts.all || opts.sections) && isFunction(this.sections)) {
    o.sections = this.sections();
  }

  if((opts.all || opts.names) && isFunction(this.names)) {
    o.names = this.names();
  }

  if((opts.all || opts.extra) && isFunction(this.extra)) {
    o.extra = this.extra();
  }

  if((opts.all || opts.value) && isFunction(this.value)) {
    o.value = this.value();
  }

  if((opts.all || opts.optional) && isFunction(this.optional)) {
    o.optional = this.optional();
  }

  if((opts.all || opts.multiple) && isFunction(this.multiple)) {
    o.multiple = this.multiple();

  }

  if(opts.all || opts.methods) {
    if(isFunction(this.converter)) {
      o.converter = this.converter();
    }
    if(isFunction(this.action)) {
      o.action = this.action();
    }
  }

  function walk(args, target) {
    var k, v;
    for(k in args) {
      v = args[k];
      target[k] = v.toObject(opts, depth);
    }
  }

  if(typeof opts.item === 'function') {
    o = opts.item.call(this, o, depth);
  }

  if(opts.recurse !== false
    && isFunction(this.options) && isFunction(this.commands)) {
    if(Object.keys(this.options()).length) {
      o.options = {};
      walk(this.options(), o.options);
    }
    if(Object.keys(this.commands()).length) {
      o.commands = {};
      ++depth;
      walk(this.commands(), o.commands);
      --depth;
    }
  }

  return o;
}
define(Argument.prototype, 'toObject', toObject, false);

function toString(delimiter, names) {
  if(!arguments.length) return Object.prototype.toString.call(this);
  names = names || this.names();
  var opt = typeof(this.extra) === 'function';
  delimiter = delimiter || ' | ';
  // TODO: sort commands correctly
  names = sortNames(names, (this instanceof Command));
  return names.join(delimiter);
}
define(Argument.prototype, 'toString', toString, false);


/**
 *  Retrieve a standardized string to use when listing options.
 */
getOptionString = function(delimiter, assignment, names, extra) {
  assignment = assignment || '=';
  delimiter = delimiter || ', ';
  extra = extra === undefined ? '' : extra;
  var opt = typeof(this.extra) === 'function';
  if(opt && extra !== false) {
    // use extracted extra data assigned to the option
    if(!extra) {
      extra = this.extra() || '';
      if(extra) {
        // collapse whitespace so that [file ...] becomes [file...]
        extra = extra.replace(/\s+(.+)/, "$1");
        // use a consistent assignment style
        extra = extra.replace(/^(.?)=(.*)$/, "$1$2");
      }
    }else if(extra === true){
      extra = this.extra();
    }
  }
  if(extra && typeof extra === 'string') {
    // custom extra specified
    extra = assignment + extra;
  }
  return this.toString(delimiter, names)
    + (typeof extra === 'string' ? extra : '');
}
define(Argument.prototype, 'getOptionString', getOptionString, false);

/**
 *  Determines whether an array consists solely of functions
 *  allowing for the special case JSON.
 *
 *  @param arr The array candidate.
 */
Argument.prototype.isFunctionArray = function(arr) {
  if(!Array.isArray(arr)) return false;
  var i, item;
  for(i = 0;i < arr.length;i++) {
    item = arr[i];
    if(item !== JSON && !(typeof item == 'function')) return false;
  }
  return true;
}

keys = Object.keys(mutators.arg);
keys.forEach(function(name) {
  var read = function() {
    return this['_' + name];
  }
  var write = function(value) {
    var key = '_' + name;
    if(!arguments.length) return this[key];
    this[key] = value;
    return this;
  }
  define(Argument.prototype, name, mutators.arg[name] ? write : read, false);
})

/**
 *  Represents an option argument.
 */
function Option() {
  Argument.apply(this, arguments);
}

util.inherits(Option, Argument);

/**
 *  Represents a flag argument.
 */
function Flag() {
  Argument.apply(this, arguments);
  //console.log('Flag %s %s', this._name, this._description);
  //this._value = false;
}

util.inherits(Flag, Argument);

/**
 *  Represents a command argument.
 */
function Command(name, description, options) {
  //events.EventEmitter.call(this);
  if(typeof name == 'object') options = name;

  // private
  define(this, '_parent', undefined, true);
  define(this, '_commands', {}, true);
  define(this, '_options', {}, true);
  define(this, '_sections', {}, true);
  define(this, '_name', name || '', true);
  define(this, '_description', description || '', true);
  define(this, '_detail', undefined, true);
  define(this, '_key', '', true);
  define(this, '_exec', {}, false);
  define(this, '_action', undefined, true);
  define(this, '_converter', undefined, true);
  define(this, '_names', undefined, true);
  define(this, '_last', undefined, true);
  define(this, '_usage', undefined, true);
  define(this, '_extra', undefined, true);
  //define(this, '_package', undefined, true);

  // helper functions for finding commands, options etc.
  var finder = {};

  for(var k in helpers) {
    finder[k] = helpers[k].bind(this);
  }

  define(this, 'finder', finder, false);

  // event emitter
  define(this, '_emitter', new events.EventEmitter(), false);
  define(this, '_events', undefined, true);
  define(this, '_maxListeners', undefined, true);
  define(this, 'domain', undefined, true);

  if((typeof options == 'object')) {
    initialize.call(this, options, Object.keys(mutators.cmd));
  }

  if(!this._name || typeof this._name !== 'string') {
    throw new TypeError('Invalid command name \'' + this._name + '\'');
  }

  this._names = this._name.split(re.delimiter());
  this._key = getKey.call(this);
}

define(Command.prototype, 'description', description, false);
define(Command.prototype, 'detail', detail, false);
define(Command.prototype, 'getOptionString', getOptionString, false);
define(Command.prototype, 'toString', toString, false);
define(Command.prototype, 'toObject', toObject, false);

var creator = {
  createOption: function(name, description, options) {
    return new Option(name, description, options);
  },
  createFlag: function(name, description, options) {
    return new Flag(name, description, options);
  },
  createCommand: function(name, description, options) {
    return new Command(name, description, options);
  }
}

// create* functions
for(k in creator) {
  define(Command.prototype, k, creator[k], false);
}

// is* functions
for(k in is) {
  define(Command.prototype, k, is[k], false);
}

/**
 *  Set options as an object group.
 */
function options(value) {
  if(!arguments.length) return this._options;
  this._options = value;

  // convert plain objects with *name*
  // to Option or Flag instances
  var k, v, clazz;
  for(k in this._options) {
    v = this._options[k];
    if(v && typeof v === 'object' && !(v instanceof Argument) && v.name) {
      if(v.key) k = v.key;
      clazz = getClassByName(v.name);
      this._options[k] = new clazz(v);
      this._options[k].key(k);
      //this._options[k].parent(this);
    }
  }
  return this;
}
define(Command.prototype, 'options', options, true);

function hasOptions() {
  for(var k in this._options) {
    return true;
  }
  return false;
}

define(Command.prototype, 'hasOptions', hasOptions, true);

/**
 *  Set commands as an object group.
 */
function commands(value) {
  if(!arguments.length) return this._commands;
  this._commands = value;

  // convert plain objects with *name*
  // to Command instances
  var k, v;
  for(k in this._commands) {
    v = this._commands[k];
    if(v && typeof v === 'object' && !(v instanceof Command) && v.name) {
      if(v.key) k = v.key;
      this._commands[k] = new Command(v);
      this._commands[k].parent(this);
      this._commands[k].key(k);
    }
  }

  return this;
}
define(Command.prototype, 'commands', commands, true);

function hasCommands() {
  for(var k in this._commands) {
    return true;
  }
  return false;
}

define(Command.prototype, 'hasCommands', hasCommands, true);

// define action so we can clear execs list
function action(value) {
  if(!arguments.length) return this._action;
  this._action = value;
  if(this.parent() && this.parent()._exec) {
    delete this.parent()._exec[this.key()];
  }
  return this;
}
define(Command.prototype, 'action', action, false);

function getLongName() {
  return this._names.reduce(function(a, b) {
    return a.length > b.length ? a : b;
  });
}
define(Command.prototype, 'getLongName', getLongName, false);

function getShortName() {
  return this._names.reduce(function(a, b) {
    return a.length < b.length ? a : b;
  });
}
define(Command.prototype, 'getShortName', getShortName, false);

function getParents(reverse, include, omit) {
  var list = include ? [this] : [];
  var p = this.parent();
  while(p) {
    list.push(p);
    p = p.parent();
  }
  // omit root program part
  if(omit && list.length > 1) list.pop();

  if(reverse) list.reverse();
  return list;
}
define(Command.prototype, 'getParents', getParents, false);

function getFullName(delimiter, reverse, include, omit) {
  delimiter = delimiter || '-';
  reverse = reverse !== undefined ? reverse : true;
  include = include !== undefined ? include : true;
  omit = omit !== undefined ? omit : false;
  var list = this.getParents(reverse, include, omit);
  list.forEach(function(cmd, index, arr) {
    arr[index] = cmd.getLongName();
  })
  return list.join(delimiter);
}
define(Command.prototype, 'getFullName', getFullName, false);

/**
 *  Get or set the command usage.
 *
 *  @param usage The command usage string.
 */
function usage(usage) {
  if(!arguments.length) return this._usage;
  this._usage = usage;
  return this;
}
define(Command.prototype, 'usage', usage, false);

for(k in EventProxy) {
  define(Command.prototype, k, EventProxy[k], false);
}

keys = Object.keys(mutators.cmd);
keys.forEach(function(name) {
  if(Command.prototype[name]) return;
  var read = function() {
    return this['_' + name];
  }
  var write = function(value) {
    var key = '_' + name;
    if(value === undefined) return this[key];
    this[key] = value;
    return this;
  }
  define(Command.prototype, name, mutators.cmd[name] ? write : read, false);
})

/**
 *  Define a command argument.
 */
function command(name, description, options) {
  var opt = (name instanceof Command) ? name
    : new Command(name, description, options);
  this._commands[opt.key()] = opt;
  this._last = this._commands[opt.key()];
  this._last.parent(this);
  if(description) {
    this._exec[opt.key()] = opt;
  }
  return description ? this : opt;
}
define(Command.prototype, 'command', command, false);

/**
 *  Inspect an argument name and determine the class (type)
 *  of argument: Option or Flag.
 */
function getClassByName(name) {
  var clazz = Option;
  if(typeof name === 'string') {
    if(re.no().test(name) || !re.extra().test(name)) {
      clazz = Flag;
    }
  }
  return clazz;
}

/**
 *  Define an option argument.
 */
function option(name, description, options, coerce, value) {
  var clazz = getClassByName(name);
  var opt = (name instanceof Option) || (name instanceof Flag) ? name
    : new clazz(name, description, options, coerce, value);
  this._options[opt.key()] = opt;
  this._last = this._options[opt.key()];
  return this;
}
define(Command.prototype, 'option', option, false);

/**
 *  Define a flag argument explicitly.
 */
function flag(name, description, options, coerce, value) {
  var opt = (name instanceof Flag) ? name
    : new Flag(name, description, options, coerce, value);
  this._options[opt.key()] = opt;
  this._last = this._options[opt.key()];
  return this;
}
define(Command.prototype, 'flag', flag, false);

/**
 *  Represents the program.
 */
function Program() {
  Command.apply(this, arguments);
  define(this, '_version', '0.0.1', true);
  define(this, '_package', undefined, true);
  define(this, '_configure', {}, true);
}

util.inherits(Program, Command);

keys = Object.keys(mutators.prg);
keys.forEach(function(name) {
  var write = function(value) {
    var key = '_' + name;
    if(!arguments.length) return this[key];
    this[key] = value;
    return this;
  }
  define(Program.prototype, name, write, false);
})

/**
 *  Get and set the program version.
 *
 *  @param semver A specific version number.
 */
function version(semver) {
  if(!arguments.length) return this._version;
  this._version = semver;
}
define(Program.prototype, 'version', version, false);

/**
 *  Assign a value to an option.
 *
 *  @param arg The argument definition.
 *  @param key The option key.
 *  @param value The value for the option.
 */
function assign(arg, key, value) {
  var receiver = this.configure().stash || this;
  receiver[key] = value;
  if(arg) arg.value(value);
}
define(Program.prototype, 'assign', assign, false);

/**
 *  Set the program package descriptor.
 *
 *  @param path The path to the package descriptor or an existing
 *  package object.
 */
function package(path) {
  if(!arguments.length) return this._package;
  if(arguments.length === 1 && !path) {
    this._package = path;
    return this._package;
  }
  var pkg;
  if(path && typeof(path) === 'string') {
    try {
      pkg = this._package = require(path);
    }catch(e) {
      throw new Error(util.format(
        'package error %s (%s)', path, e.message.toLowerCase()));
    }
  }else if(path && typeof path === 'object') {
    pkg = this._package = path;
  }
  if(!pkg) {
    throw new Error(util.format(
      'package descriptor %s does not exist', path));
  }
  this._version = pkg.version;
  if(pkg.description) this._description = pkg.description;
  return this;
}
define(Program.prototype, 'package', package, false);

/**
 *  Initialize the program from a package.json
 *  project descriptor, optionally overriding
 *  the name, description and class to instantiate.
 *
 *  @param package The path to package.json.
 *  @param name A specific name for the root command (optional).
 *  @param description A specific description for the root command (optional).
 *  @param clazz A specific class to instantiate.
 */
function create(package, name, description, clazz) {
  clazz = clazz || Program;
  var program = new clazz(name || basename(process.argv[1]));
  program.package(package);
  if(name) program.name(name);
  if(description) program.description(description);
  return program;
}

module.exports = create;
module.exports.re = re;
module.exports.define = define;
module.exports.initialize = initialize;
module.exports.mutators = mutators;
module.exports.key = getKey;
module.exports.Program = Program;
module.exports.Command = Command;
module.exports.Option = Option;
module.exports.Flag = Flag;
module.exports.Argument = Argument;
module.exports.sortNames = sortNames;
module.exports.Description = Description;
