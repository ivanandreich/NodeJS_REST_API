function collect(map) {
  var k, list = [];
  for(k in map) {
    list.push(map[k]);
  }
  return list;
}

var include = function(assign) {
  var k, v;
  var map = {
    action: require('cli-mid-action'),
    boot: require('cli-mid-boot'),
    color: require('cli-mid-color'),
    command: require('cli-mid-command'),
    convert: require('cli-mid-convert'),
    debug: require('cli-mid-debug'),
    defaults: require('cli-mid-defaults'),
    ecommand: require('cli-mid-ecommand'),
    empty: require('cli-mid-empty'),
    emultiple: require('cli-mid-emultiple'),
    env: require('cli-mid-env'),
    erequired: require('cli-mid-erequired'),
    error: require('cli-mid-error'),
    eunknown: require('cli-mid-eunknown'),
    events: require('cli-mid-events'),
    exec: require('cli-mid-exec'),
    help: require('cli-mid-help'),
    load: require('cli-mid-compiler').load,
    logger: require('cli-mid-logger'),
    manual: require('cli-mid-manual'),
    merge: require('cli-mid-merge'),
    multiple: require('cli-mid-multiple'),
    notify: require('cli-mid-notify'),
    parser: require('cli-mid-parser'),
    rc: require('cli-mid-rc'),
    ready: require('cli-mid-ready'),
    run: require('cli-mid-run'),
    stdin: require('cli-mid-stdin'),
    substitute: require('cli-mid-compiler').substitute,
    unparsed: require('cli-mid-unparsed'),
    variables: require('cli-mid-variables'),
    verbose: require('cli-mid-verbose'),
    version: require('cli-mid-version')
  }

  // legacy mode where middleware was available
  // via named properties
  if(assign) {
    for(k in map) {
      v = map[k];
      module.exports[k] = v;
    }
  }

  return {map: map, list: collect(map), keys: Object.keys(map)}
}

function standard() {
  var list = [
    require('cli-mid-error'),
    require('cli-mid-stdin'),
    require('cli-mid-boot'),
    require('cli-mid-compiler'),
    require('cli-mid-parser'),
    require('cli-mid-unparsed'),
    require('cli-mid-defaults'),
    require('cli-mid-events'),
    require('cli-mid-action'),
    require('cli-mid-eunknown'),
    require('cli-mid-emultiple'),
    require('cli-mid-erequired'),
    require('cli-mid-rc'),
    require('cli-mid-env'),
    require('cli-mid-multiple'),
    require('cli-mid-merge'),
    require('cli-mid-convert'),
    require('cli-mid-variables'),
    require('cli-mid-notify'),
    require('cli-mid-ecommand'),
    require('cli-mid-ready'),
    require('cli-mid-exec'),
    require('cli-mid-command'),
    require('cli-mid-empty'),
    require('cli-mid-run'),
  ];
  return list;
}

var providers = {
  standard: standard
}

providers.include = include;
providers.help = require('cli-mid-help');
providers.version = require('cli-mid-version');

module.exports = providers;
