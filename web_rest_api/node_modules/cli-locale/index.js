var language = 'en';

/**
 *  Sanitize the value of an LC variable removing any character
 *  encoding portion, such that en_GB.UTF-8 becomes en_gb.
 *
 *  @param lang A language identifier extracted from an LC variable.
 *  @param filter A filter function.
 *
 *  @return A sanitized language identifier.
 */
function sanitize(lang, filter) {
  if(!(typeof lang == 'string')) return lang;
  lang = lang.replace(/\..*$/, '').toLowerCase();
  if(typeof filter == 'function') {
    lang = filter(lang);
  }
  return lang;
}

/**
 *  Compares whether the language string equals the
 *  string *c* and returns the default if it does.
 *
 *  @param lang The language candidate.
 */
function c(lang) {
  return lang == 'c' ? language : lang;
}

/**
 *  Find the value of an LC environment variable and return a
 *  sanitized represention of the locale.
 *
 *  If no variable value is found in the search array then this
 *  method returns the first available LC variable.
 *
 *  @param search An array of LC variables to prefer.
 *  @param filter A filter function.
 *  @param strict A boolean indicating that the default language
 *  should never be returned.
 *
 *  @return A language identifier.
 */
function find(search, filter, strict) {
  var lang, search = search || [], i, k, v, re = /^(LC_|LANG)/;
  for(i = 0;i < search.length;i++) {
    lang = sanitize(process.env[search[i]] || '', filter);
    if(lang) return c(lang);
  }
  // nothing found in search array, find first available
  for(k in process.env) {
    v = process.env[k];
    if(re.test(k) && v) {
      lang = sanitize(v, filter);
      if(lang) break;
    }
  }
  if(!lang) lang = c(sanitize(process.env.LANG, filter));
  return c(lang) || (!strict ? language : null);
}

module.exports = function(lang) {
  module.exports.language = language = lang;
  return module.exports;
}

module.exports.sanitize = sanitize;
module.exports.find = find;
module.exports.language = language;
