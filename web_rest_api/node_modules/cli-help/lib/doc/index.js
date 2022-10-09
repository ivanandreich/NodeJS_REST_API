var doc = require('./doc');
module.exports = {
  doc: doc,
  json: require('./json'),
  gnu: require('./gnu'),
  cmd: require('./cmd'),
  synopsis: require('./synopsis'),
  markdown: require('./markdown'),
  man: require('./man')
}
