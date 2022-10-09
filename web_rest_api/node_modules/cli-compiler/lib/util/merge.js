var define = require('cli-define')
  , utils = require('cli-util')
  , copy = utils.merge
  , Option = define.Option
  , Command = define.Command
  , ConverterMap = require('cli-converter-util').ConverterMap;

/**
 *  Merge an option or command definition with parsed program data.
 *
 *  This allows callback functions (converter/action) to be merged
 *  with the parsed definition.
 *
 *  @param arg The existing command or option definition.
 *  @param key The key for the option or command.
 *  @param definition The object to merge with the existing
 *  option.
 */
function merge(arg, key, definition) {
  if(typeof definition === 'function'
    || Array.isArray(definition)
    || (definition instanceof ConverterMap)) {

    // set converter for options
    if(arg instanceof Option) {
      arg.converter(definition);

    // set actions for commands
    }else if(arg instanceof Command) {
      arg.action(definition);
    }
  // object definition, merge into arg
  }else if(definition
    && typeof definition === 'object'
    && !Array.isArray(definition)) {

    var def = copy(definition, {}, {copy: true});

    var mutators = (arg instanceof Command) ?
      Object.keys(define.mutators.cmd) : Object.keys(define.mutators.arg);

    // cannot override calculated data
    delete def.name;
    delete def.key;
    delete def.extra;
    delete def.names;
    delete def.commands;
    delete def.options;

    define.initialize.call(arg, def, mutators);
  }
}

module.exports = merge;
