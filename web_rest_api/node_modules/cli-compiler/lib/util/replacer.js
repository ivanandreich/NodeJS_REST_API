var define = require('cli-define')
  , flutil = require('cli-flag-util')
  , sortNames = define.sortNames
  , environ = require('cli-env')
  , utils = require('cli-util');

// TODO: move this to the define module?
function getOption(arg, long) {
  var names = arg.names(), i;
  var cmd = typeof arg.isCommand === 'function' && arg.isCommand();
  names = sortNames(names, cmd);
  if(cmd && !long || !cmd && long) {
    names.reverse();
  }
  return names[0];
}

function getListData(data, target, prefix, delimiter) {
  var z, arg, full, variants;
  var re = /^(version|help)opt$/;
  //console.dir(target.raw);
  for(z in target) {
    //console.log('got list item on key %s', z);
    arg = target[z];
    // the built in help and version options use an
    // opt suffix so as not to conflict with the help()
    // and version() methods, here we strip that so the
    // variable references are cleaner for those options
    if(re.test(z)) z = z.replace('opt', '');
    z = utils.delimited(z, '_', true);
    full = prefix + z + delimiter;
    data[full + 'name'] = arg.name();
    data[full + 'long'] = getOption(arg, true);
    data[full + 'short'] = getOption(arg);
    if(
      (typeof arg.isCommand === 'function' && !arg.isCommand())
      && arg.extra()) {
      data[full + 'extra'] = arg.extra();
    }
    data[full + 'help'] = arg.getOptionString();
    data[full + 'pipe'] = arg.toString(null);
    data[full + 'comma'] = arg.toString(', ');
    if(flutil.re.no().test(arg.name())) {
      variants = flutil.getNoVariants(arg);
      data[full + 'yes'] = variants.yes;
      data[full + 'no'] = variants.no;
    }
  }
}

function getDescription(arg, data, escaped) {
  var description = arg.description();
  description.md = environ.replace(description.md, data, escaped);
  description.txt = environ.replace(description.txt, data, escaped);
  var detail = arg.detail();
  if(detail) {
    detail.md = environ.replace(detail.md, data, escaped);
    detail.txt = environ.replace(detail.txt, data, escaped);
  }
}

function update(data, target, escaped) {
  var z;
  for(z in target) {
    getDescription(target[z], data, escaped);
  }
}

function object(data, target, escaped) {
  var z;
  for(z in target) {
    target[z] =
      environ.replace(target[z], data, escaped);
  }
}

function array(data, target, escaped) {
  for(var i = 0;i < target.length;i++) {
    if(typeof target[i] === 'string') {
      target[i] = environ.replace(target[i], data, escaped);
    }else if(Array.isArray(target[i])) {
      array(data, target[i], escaped);
    }else if(target[i] && typeof target[i] === 'object') {
      object(data, target[i], escaped);
    }
  }
}

function sections(data, target, escaped) {
  var z, k;
  for(z in target) {
    if(typeof target[z] === 'string') {
      target[z] = environ.replace(target[z], data, escaped);
    }else if(Array.isArray(target[z])) {
      array(data, target[z], escaped);
    }else if(target[z]
      && typeof target[z] === 'object') {
      //console.dir(target[z]);
      object(data, target[z], escaped);
    }
  }
}

/**
 *  Replace string values with variables.
 *
 *  Should be invoked in the scope of a program.
 *
 *  @param data The object containing variables to use
 *  as replacements.
 *  @param escaped Whether escaped dollar characters are supported.
 */
function replacer(data, escaped) {
  var conf = this.configure();
  var delimiter = '_';
  var prefixes = {
    opt: 'opt' + delimiter,
    cmd: 'cmd' + delimiter
  }

  // update data object
  getListData(data, this._options, prefixes.opt, delimiter);
  getListData(data, this._commands, prefixes.cmd, delimiter);

  // also handle level 2 options/commands
  // TODO: we really need to do this recursively and not clash on prefixes
  for(var z in this._commands) {
    // sub-options
    if(Object.keys(this._commands[z]._options).length) {
      getListData(data, this._commands[z]._options, prefixes.opt, delimiter);
    }
    // sub commands
    if(Object.keys(this._commands[z]._commands).length) {
      getListData(data, this._commands[z]._commands, prefixes.cmd, delimiter);
    }
  }

  // substitute on name/description
  this.name(environ.replace(this.name(), data, escaped));
  getDescription(this, data, escaped);

  // update command and options
  update(data, this._options, escaped);
  update(data, this._commands, escaped);

  // update manual sections
  sections(data, this.sections(), escaped);

  // update top-level command sections
  var keys = Object.keys(this._commands);
  if(keys.length) {
    for(var k  in this._commands) {
      sections(data, this._commands[k].sections(), escaped);
    }
  }
}

module.exports = replacer;
