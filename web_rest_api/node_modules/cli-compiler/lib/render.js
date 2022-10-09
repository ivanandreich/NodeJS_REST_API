var EOL = require('os').EOL;
var markzero = require('markzero');
var manual = markzero.manual;
var Parser = markzero.Parser;
var ProgramRenderer = require('./util/renderer');

var options = new RegExp('^' + manual.OPTIONS + '$', 'i');
var commands = new RegExp('^' + manual.COMMANDS + '$', 'i');

/**
 *  Render tokens into the program instance.
 */
function render(req, next) {
  var opts = req.argv
    , def = opts.def
    , tokens = opts.tokens
    , name = opts.name
    , description = opts.description
    , version = opts.version
    , program = req.program;

  // take name from h1
  if(tokens.length
    && tokens[0].type === 'heading'
    && tokens[0].depth === 1) {
    //console.log('setting name %s', tokens[0].text);
    program.name(tokens[0].text);
    tokens.shift();
  }

  // remove subsequent heading
  // taking care not to remove specially
  // recognized headings
  if(tokens.length
    && tokens[0].type === 'heading'
    && tokens[0].depth === 2
    && !options.test(tokens[0].text)
    && !commands.test(tokens[0].text)) {
    tokens.shift();
  }

  // take description from initial paragraph(s)
  var desc = '', detail = '';
  while(tokens.length
    && tokens[0].type === 'paragraph') {
    if(!description) {
      description = tokens[0].text;
    }else{
      detail += !detail ? tokens[0].text : EOL + EOL + tokens[0].text;
    }
    tokens.shift();
  }

  if(desc) program.description(desc);
  if(detail) program.detail(detail);

  var renderer = new ProgramRenderer(null, program, def);
  var parser = new Parser({renderer: renderer});

  try {
    parser.parse(tokens);
  }catch(e) {
    return next(e);
  }

  // compiler option overrides
  if(name) program.name(name);
  if(version) program.version(version);
  if(description) program.description(description);

  next();
}

module.exports = render;
