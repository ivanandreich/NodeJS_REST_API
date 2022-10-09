var markzero = require('markzero')
  , Parser = markzero.Parser
  , TextRenderer = markzero.TextRenderer
  , lexer = new markzero.Lexer()
  , renderer = new TextRenderer;

/**
 *  Encapsulates a string represented as markdown and plain text.
 */
function Description(def) {
  if(typeof def === 'string') {
    this.parse(def);
  }else if(def
    && typeof def === 'object'
    && typeof def.txt === 'string'
    && typeof def.md === 'string') {
    this.md = def.md;
    this.txt = def.txt;
  }else{
    throw new Error('invalid value for description');
  }
}

/**
 *  Parse a markdown string to produce a plain text version.
 */
Description.prototype.parse = function(md) {
  this.md = '' + md;
  var tokens = lexer.lex(md);
  var parser = new Parser({renderer: renderer});
  this.txt = parser.parse(tokens).replace(/\s+$/, '');
}

/**
 *  Get the plain text description.
 */
Description.prototype.toString = function() {
  return this.txt;
}

/**
 *  Convert a string or object to a Description.
 *
 *  @param def The description definition.
 */
function toDescription(def) {
  if(def instanceof Description) return def;
  return new Description(def);
}

module.exports = Description;
module.exports.toDescription = toDescription;
