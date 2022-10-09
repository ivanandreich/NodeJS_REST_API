var expect = require('chai').expect;
var lc = require('../..'), find = lc.find;
var en = 'en';
var enus = 'en_US';
var engb = 'en_GB.UTF-8';
var search = ['LC_ALL', 'LC_MESSAGES'];

// stash any original LC variables
var vars = {};
function stash() {
  vars.LANG = process.env.LANG;
  for(var z in process.env) {
    if(/^LC_/.test(z)) {
      vars[z] = process.env[z];
    }
  }
}
function clear() {
  process.env.LANG = '';
  for(var z in process.env) {
    if(/^LC_/.test(z)) {
      process.env[z] = '';
    }
  }
}
function restore() {
  for(var z in vars) {
    process.env[z] = vars[z];
  }
}

describe('cli-locale:', function() {
  stash();
  clear();
  lc(en);
  it('should return default language with no LC variables', function(done) {
    var lang = find(search);
    expect(lang).to.be.a('string').that.equals(lc.language);
    done();
  });
  it('should return language from search array', function(done) {
    process.env.LC_MESSAGES = enus;
    var lang = find(search);
    expect(lang).to.be.a('string').that.equals('en_us');
    done();
  });
  it('should return language from first available', function(done) {
    process.env.LC_MESSAGES = '';
    process.env.LC_TIME= engb;
    var lang = find(search);
    expect(lang).to.be.a('string').that.equals('en_gb');
    done();
  });
  it('should return language from LANG', function(done) {
    clear();
    process.env.LANG = enus;
    var lang = find(search);
    expect(lang).to.be.a('string').that.equals('en_us');
    done();
  });
  it('should return default language when LC_ALL=C', function(done) {
    clear();
    process.env.LC_ALL = 'C';
    var lang = find(search);
    expect(lang).to.be.a('string').that.equals(lc.language);
    done();
  });
  it('should return default language when LC_TIME=C', function(done) {
    clear();
    process.env.LC_TIME = 'C';
    var lang = find(search);
    expect(lang).to.be.a('string').that.equals(lc.language);
    done();
  });
  it('should return default language when LC_MESSAGES=C', function(done) {
    clear();
    process.env.LC_MESSAGES = 'C';
    var lang = find(search);
    expect(lang).to.be.a('string').that.equals(lc.language);
    done();
  });
  it('should return default language when LC_TIME=C', function(done) {
    clear();
    process.env.LC_TIME = 'C';
    var lang = find();
    expect(lang).to.be.a('string').that.equals(lc.language);
    done();
  });
  it('should return default language when LANG=C', function(done) {
    clear();
    process.env.LANG = 'C';
    var lang = find(search);
    expect(lang).to.be.a('string').that.equals(lc.language);
    done();
  });
  it('should return null when strict', function(done) {
    clear();
    process.env = {};
    var lang = find(search, null, true);
    expect(lang).to.eql(null);
    done();
  });
  it('should return null with invalid filter function', function(done) {
    clear();
    process.env = {};
    process.env.LANG = enus;
    var lang = find(search, function(){return null;}, true);
    expect(lang).to.eql(null);
    done();
  });
})
