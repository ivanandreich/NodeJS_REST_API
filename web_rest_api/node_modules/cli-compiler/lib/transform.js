var path = require('path')
  , fs = require('fs')
  , util = require('util')
  , async = require('async')
  , circular = require('circular')
  , esprima = require('esprima')
  , escodegen = require('escodegen')
  , EOL = require('os').EOL;

var formats = {
  prg: 'var prg = %s;',
  pkg: 'var pkg = %s;',
  cfg: 'var cfg = %s;',
  opt: 'var opt = %s;',
  cmd: 'var cmd = %s;',
}

/**
 *  Get the transformer document ast.
 */
function transformer(cb) {
  var mod = path.join(__dirname, 'transformer.js');
  fs.readFile(mod, function(err, contents) {
    cb(err, contents ? esprima.parse('' + contents) : contents);
  })
}

/**
 *  Apply transformations to the core ast and
 *  add them to an array of ast blocks.
 */
function apply(req, ast, cb) {
  var opts = req.argv
    , program = req.program
    , opts = program.options()
    , cmds = program.commands()
    , funcbody = ast.body[0].body.body;

  function extract(ast) {
    return ast.body[0];
  }

  function preamble(cb) {
    // TODO: include comment
    var js = '// automatically generated, do not modify';
    cb(null, [esprima.parse(js, {comment: true})]);
  }


  // declare the prg variable
  function prg(cb) {
    var prg = program.toObject({all: true, recurse: true});
    delete prg.names;
    var js = util.format(formats.prg, circular.stringify(prg));
    funcbody.unshift(extract(
      esprima.parse('program.sections(prg.sections);')));
    funcbody.unshift(extract(
      esprima.parse('program.detail(prg.detail);')));
    funcbody.unshift(extract(
      esprima.parse('program.description(prg.description);')));
    funcbody.unshift(extract(
      esprima.parse('program.version(prg.version);')));
    funcbody.unshift(extract(
      esprima.parse('program.name(prg.name);')));
    cb(null, [esprima.parse(js)]);
  }


  // declare the pkg variable
  function pkg(cb) {
    var pkg = program.package();
    if(!pkg) return cb(null, []);
    var js = util.format(formats.pkg, circular.stringify(pkg));
    funcbody.unshift(extract(esprima.parse('program.package(pkg);')));
    cb(null, [esprima.parse(js)]);
  }

  // declare the cfg variable
  function cfg(cb) {
    var c = esprima.parse('' + req.sources.configure.data);
    // get module exports object expression
    var oe = c.body[0].expression.right;
    var js = util.format(formats.cfg, escodegen.generate(oe));
    funcbody.unshift(extract(esprima.parse('program.configure(cfg);')));
    cb(null, [esprima.parse(js)]);
  }

  // declare the opt variable
  function opt(cb) {
    funcbody.unshift(
      extract(esprima.parse('program.options(prg.options);')));
    cb(null, []);
  }

  // declare the cmd variable
  function cmd(cb) {
    funcbody.unshift(
      extract(esprima.parse('program.commands(prg.commands);')));
    cb(null, []);
  }

  // add the transformer ast, should be at the end
  function std(cb) {
    cb(null, [ast]);
  }

  var transformations = [];
  transformations.push(preamble);

  if(Object.keys(opts).length) {
    transformations.push(opt);
  }
  if(Object.keys(cmds).length) {
    transformations.push(cmd);
  }

  transformations.push(prg);

  if(req.sources.configure) {
    transformations.push(cfg);
  }

  transformations.push(pkg);

  transformations.push(std);

  async.concatSeries(transformations, function iterator(func, cb) {
    func(cb);
  }, function(err, blocks) {
    cb(err, blocks);
  })
}

/**
 *  Flatten the transformation blocks back to a single ast.
 */
function flatten(blocks, cb) {
  // primary transformer function block
  var trast = blocks[blocks.length - 1];
  var ast = {type: trast.type, body: []};
  for(var i = 0;i < blocks.length;i++) {
    ast.body = ast.body.concat(blocks[i]);
  }
  return cb(null, ast);
}

/**
 *  Convert the ast to a javascript string.
 */
function stringify(ast, cb) {
  var opts = {format: {indent: {style: '  '}}, base: 0, indent: ''};
  var js;
  try {
    js = escodegen.generate(ast, opts);
  }catch(e) {
    return cb(e);
  }
  cb(null, js);
}

/**
 *  Transform the program definition to a javascript module.
 *
 *  The module exports a single function which may be invoked with an existing
 *  program instance, the program instance will be decorated with the data
 *  parsed during the compilation process.
 */
function transform(req, next) {
  var opts = req.argv
    , program = req.program;

  // get base ast from template
  transformer(function(err, ast) {
    if(err) return next(err);
    // apply ast transformations
    apply(req, ast, function(err, blocks) {
      if(err) return next(err);
      // flatten transformation blocks
      flatten(blocks, function(err, ast) {
        if(err) return next(err);
        // convert ast to javascript string (escodegen)
        stringify(ast, function(err, js) {
          req.js = js;
          next();
        });
      });
    });
  });
}

module.exports = transform;
