var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , ext = /\.(md|markdown)$/
  , EOL = require('os').EOL;

/**
 *  Find markdown documents from input files and directories,
 *  does not recurse into child directories.
 */
function find(input, cb) {
  async.concatSeries(input, function iterator(file, cb) {
    fs.stat(file, function(err, stats) {
      if(err) return cb(err);
      if(stats.isFile() && ext.test(file)) {
        return cb(null, [file]);
      }else if(stats.isDirectory()) {
        fs.readdir(file, function(err, files) {
          if(err) return cb(err);
          files = files.filter(function(f) {
            return ext.test(f);
          }).map(function(f) {
            return path.join(file, f);
          })
          return cb(null, files);
        })
      }
    })
  }, function result(err, results) {
    cb(err, results);
  });
}

/**
 *  Read markdown documents into an array of buffers.
 */
function read(files, cb) {
  async.concatSeries(files, function iterator(file, cb) {
    fs.readFile(file, function(err, buffer) {
      cb(err, [buffer]);
    })
  }, function result(err, results) {
    cb(err, results);
  });
}

/**
 *  Coerce documents to strings and concatenate to a single document.
 */
function concatenate(docs, cb) {
  var doc = '', partial;
  docs.forEach(function(buf) {
    partial = '' + buf;
    partial = partial.replace(/\s+$/, '');
    if(partial) {
      doc += partial + EOL + EOL;
    }
  })
  cb(null, doc);
}

/**
 *  Compiler concatenation phase.
 */
function cat(req, next) {
  var opts = req.argv
    , input = opts.input;
  find(input, function(err, files) {
    if(err) return next(err);
    opts.files = files;
    read(files, function(err, docs) {
      if(err) return next(err);
      concatenate(docs, function(err, markdown) {
        if(err) return next(err);
        opts.markdown = markdown;
        next();
      });
    })
  });
}

module.exports = cat;
