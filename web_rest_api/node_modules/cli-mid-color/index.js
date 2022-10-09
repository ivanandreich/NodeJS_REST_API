//var types = require('cli-types');
//
var ttyref;

if(!global.hasOwnProperty('ttycolor')) {
  Object.defineProperty(global, "ttycolor", {
    set: function(value) {
      ttyref = value;
    },
    get: function() {
      return ttyref;
    }
  })
}

/**
 *  Initialize ansi color support and add options
 *  that correspond to the ttycolor options.
 *
 *  The color configuration supports:
 *
 *  - defaults: Boolean indicating default styles should be initialized.
 *  - option: Object defining the option: {always: '--color', never:
 *  '--no-color'}
 *  - styles: Custom styles to pass when initializing the module.
 *  - validate: A boolean indicating that the option should use enum
 *  validation for the available values, not that specifying this will
 *  disable support for --no-color.
 *  - stderr Redirect all messages to the stderr stream, default is true.
 *
 *  @param conf A color configuration object.
 *  @param description The option description.
 */
module.exports = function(conf, name, description, stderr) {
  conf = conf || {};
  var serr = true
    , config = this.configure();
  for(var i = 1;i < arguments.length;i++) {
    if(typeof arguments[i] === 'boolean') {
      serr = arguments[i];
      break;
    }
  }
  //console.log('color middle %s', name);
  //console.dir(conf);
  //console.dir(conf);
  var ttycolor = require('ttycolor');
  var list = Object.keys(ttycolor.parser.modes);
  //list.push(false);   // allow --no-color
  //var name = conf.option && conf.option.always ? conf.option.always
    //: ttycolor.parser.option.always;
  name = name || '--[no]-color';
  if(conf.defaults !== false) {

    config.ttycolor = {};
    // disable options parser
    config.ttycolor.revert = ttycolor(false, false).defaults(conf.styles, serr);

    // TODO: remove this and the defineProperty() statement
    // this is far from ideal but this is the only way
    // currently to allow the logger console stream to detect
    // whether ttycolor has been initialized
    global.ttycolor = ttycolor;

  }
  this.on('color', function oncolor(req, arg, value) {
    ttycolor.mode = (value === false)
      ? ttycolor.parser.never : ttycolor.parser.auto;
  })
  //console.log('color middle final %s', name);
  //console.dir(name);
  //

  //this.flag(
    //name, description || 'enable or disable terminal colors',
    //conf.validate ? types.enum(list) : null);
  //if(conf.validate) this.last().value(ttycolor.parser.auto);

  this.flag(
    name, description || 'enable or disable terminal colors');
  //if(conf.validate) this.last().value(ttycolor.parser.auto);
  return this;
}
