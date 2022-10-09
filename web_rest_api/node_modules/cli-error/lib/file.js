var path = require('path'), config;
var clierr = require('..');
var lc = require('cli-locale');
var errors = {}, load;

/**
 *  Load error definitions from a file.
 */
function file(options, callback) {
  if(typeof options == 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  callback = callback || function(){}
  var fallback = options.fallback || config.lang;
  var lang = options.lang;
  var locales = options.locales || config.locales;
  var extension = 'json', pth, source;
  var search = options.lc || config.lc;
  if(!lang) {
    lang = lc.find(search, null, true);
  }
  // always load fallback definitions
  if(fallback) {
    try {
      pth = path.join(locales, fallback) + '.' + extension;
      source = require(pth);
      load(source);
    }catch(e) {
      return callback(e);
    }
  }
  // only attempt to load if lang has been specified
  // or if we found a lang in the LC variables
  if(lang) {
    pth = path.join(locales, lang) + '.' + extension;
    try {
      source = require(pth);
      load(source);
    }catch(e) {}
  }
  return callback(null, pth, errors, lang);
}

module.exports = function(conf, errs, loader) {
  config = conf;
  errors = errs;
  load = loader;
  return module.exports;
}

module.exports.file = file;
