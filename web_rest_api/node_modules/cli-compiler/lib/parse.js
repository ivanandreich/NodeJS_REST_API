var markzero = require('markzero')
  , util = require('util');

/**
 *  Parse markdown document to tokens.
 */
function parse(req, next) {
  var opts = req.argv
    , markdown = opts.markdown
    , lexer = new markzero.Lexer()
    , program = req.program
    , tokens;

  // we need to set up some initial
  // data for the replace middleware
  req.environment = {
    0: program.name(),
    cli: util.format('%s(1)', program.name()),
    description: program.description()
  }

  try {
    tokens = lexer.lex(markdown);
  }catch(e) {
    return next(e);
  }

  opts.tokens = tokens;
  next();
}

module.exports = parse;
