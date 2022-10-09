var fs = require('fs');

function write(req, next) {
  var opts = req.argv;
  if(!opts.output) return next();
  fs.writeFile(opts.output, req.js, function(err) {
    if(err) return next(err);
    if(opts.print === true) return next();
    req.complete();
  })
}

module.exports = write;
