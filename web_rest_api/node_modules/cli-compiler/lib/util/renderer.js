var EOL = require('os').EOL
  , util = require('util')
  , utils = require('cli-util')
  , camelcase = utils.camelcase
  , markzero = require('markzero')
  , manual = markzero.manual
  , MarkdownRenderer = markzero.MarkdownRenderer
  , ltrim = require('cli-util').ltrim
  , define = require('cli-define')
  , Option = define.Option
  , Command = define.Command
  , ConverterMap = require('cli-converter-util').ConverterMap
  , defmerge = require('../util/merge');

var COPYRIGHT = 'copyright';
var re = {};
var layout = manual.layout.slice(0);
layout.push(COPYRIGHT);
layout.forEach(function(key) {
  re[key] = new RegExp('^' + key + '$', 'i');
})

// process these sections
var known = [
  manual.NAME,
  manual.DESCRIPTION,
  manual.COMMANDS,
  manual.OPTIONS
];

//console.dir(known);

function Renderer(options, cli, def) {
  MarkdownRenderer.apply(this, arguments);
  def = def || {};

  // which section are we in
  this.section = null;
  this.conf = cli.configure();
  this.conf.help = this.conf.help || {};
  this.conf.help.sections = {};
  this.cli = cli;
  this.parent = this.cli;
  this.def = def;
  // current location in definition hierarchy
  this.current = def;
  def.options = def.options || {};
  def.commands = def.commands || {};
}

util.inherits(Renderer, MarkdownRenderer);

Renderer.prototype.getParentCommand = function(text, parent) {
  parent = parent || this.parent;
  var cmds = parent.commands()
    , key = ('' + text).toLowerCase()
    , re = new RegExp('^' + parent.key(), 'i')
    , z;

  key = camelcase(key.replace(/\s+/, '-'));

  if(re.test(key)) {
    return parent;
  }

  for(z in cmds) {
    re = new RegExp('^' + z, 'i');
    if(re.test(key)) {
      return cmds[z];
    }
  }
  throw new Error(
    util.format(
      'failed to locate command for level 3 heading %s', [text]));
}

Renderer.prototype.heading = function(text, level, raw) {
  this.section = null;
  this.level = level;
  if(level === 2 || level === 4) {
    this.last = null;
    for(var z in re) {
      if(re[z].test(text)) {
        this.section = z;
        if(this.section !== manual.OPTIONS
           && this.section !== manual.COMMANDS
           && this.section !== manual.DESCRIPTION) {
          this.custom = level;
        }
        break;
      }
    }
    if(!this.section) {
      this.section = text;
      this.custom = level;
    }
  // adding options/commands to an existing command
  }else if(level === 3) {
    this.section = null;
    this.parent = this.getParentCommand(text);
    if(this.def.commands) {
      this.current = this.def.commands[this.parent.key()] || {};
    }
  }
}

Renderer.prototype.code = function(code, lang, escaped) {
  if(this.section === manual.SYNOPSIS) {
    this.cli.usage(code);
  }
}

Renderer.prototype.end = function(){}

Renderer.prototype.token = function(token, parser) {
  var next = parser.peek()
    , key = (this.section || '').toLowerCase().replace(/\s+/g, '-')
    , append = true
    , add = true
    , item
    , detail
    , sections = this.parent.sections();

  if(token.type === 'comment') return;
  //if(token.type === 'space') return;

  if(this.custom
    && token.type === 'heading'
    && (this.custom === 4 && token.depth <= this.custom)) {
    this.custom = null;
  }

  // custom level 2 sections, such as history
  if(
    (this.level === 2 || this.level === 4)
    && this.custom && this.section
    && key !== manual.OPTIONS && key !== manual.COMMANDS) {

    if(token.raw && !this.inList) {
      if(this.level === 2 && next
        && token.type === 'heading' && token.depth >= 2) {
        this.custom = null;
        append = false;
      }

      item = sections[key];
      if(!item) {
        item = {
          title: this.section,
          key: key,
          text: ''
        }
        this.parent.sections()[key] = item;
      }

      if(append) {
        //console.log('appending %j', token.type);

        item.text
          += /^\s*$/.test(token.raw) ? '' : token.raw;
      }
    }
  }

  // concat descriptions to existing description
  // for commands
  else if(this.section === manual.DESCRIPTION && this.level === 4
    && token.type !== 'heading' && this.parent) {
    if(/^list/.test(token.type) && token.type !== 'list_start' || this.inList) {
      add = false;
    }
    if(add) {
      detail = this.parent.detail();
      if(!detail) {
        this.parent.detail(token.raw);
      }else{
        detail.md += EOL + EOL + token.raw;
        this.parent.detail(detail.md);
      }
    }
  }

  else if(token.type === 'paragraph') {
    // this adds a detail for commands by defining paragraphs below the
    // command level 3 heading but before the level 4 child options/commands
    if(this.parent !== this.cli && this.section === null) {
      detail = this.parent.detail();
      if(!detail) {
        this.parent.detail(token.text);
      }else{
        detail.md += EOL + EOL + token.text;
        this.parent.detail(detail.md);
      }
    // this handles command/option descriptions with hard-line breaks
    // in the list description
    }else if(this.last) {
      var desc = this.last.description();
      desc.md += EOL + EOL + token.text;
      this.last.description(desc.md);
    }
  }

  // reset parent variables
  if((this.parent !== this.cli
    && next
    && next.type === 'heading' && (next.depth < 4))) {
    this.section = null;
    this.parent = this.cli;
  }

  // keep track of whether we are in a list
  switch(token.type) {
    case 'list_start':
      this.inList = true;
      break;
    case 'list_end':
      this.inList = false;
      break;
  }

  if(!next) this.end();
}

Renderer.prototype.merge = function(key) {
  var last = this.last = this.parent.last();
  var target = this.current[key] || {};
  var definition = target[last.key()];
  return defmerge(last, key, definition);
}

Renderer.prototype.parseListItemText = function(text) {
  var info = {};
  var re = /^(`)(\!?)([^`]+)(`)(\s*:\s*)(.*)/;
  text.replace(re, function(
    match, backtick, exec, name, backtick, delimiter, description) {
    info.name = name;
    info.exec = !!exec;
    info.description = description;
  });
  return info;
}

Renderer.prototype.addOption = function(text, cmd) {
  cmd = cmd || this.cli;
  var info = this.parseListItemText(text);
  if(this.section === manual.OPTIONS) {
    cmd.option(info.name, info.description);
  }else if(this.section === manual.COMMANDS) {
    // add as an external executable
    if(info.exec) {
      cmd.command(info.name, info.description);
    // add as an action executable
    }else{
      cmd.command(info.name);
      this.parent.last().description(info.description);
    }

    //console.log('added command "%s" to %s',
      //this.parent.last().key(), this.parent.key());
  }
  this.merge(this.section);
}

Renderer.prototype.listitem = function(text, start, end) {
  if(this.section === manual.OPTIONS || this.section === manual.COMMANDS) {
    this.addOption(text, this.parent);
  }
  return text;
};

module.exports = Renderer;
