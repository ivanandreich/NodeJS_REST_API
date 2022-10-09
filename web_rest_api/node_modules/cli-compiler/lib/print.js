var fs = require('fs');

function print(req, next) {
  var opts = req.argv;
  if(opts.print !== true) return next();
  if(req.js) {
    process.stdout.write(req.js);
  }else if(req.cache) {
    return fs.readFile(req.cache.file, function(err, data) {
      if(err) return next(err);
      process.stdout.write('' + data);
      next();
    })
  }
  next();
}

module.exports = print;
