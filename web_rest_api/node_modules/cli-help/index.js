module.exports = require('./lib');
for(var k in module.exports.documents.doc) {
  module.exports[k] = module.exports.documents.doc[k];
}
