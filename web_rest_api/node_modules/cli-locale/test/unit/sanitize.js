var expect = require('chai').expect;
var lc = require('../..'), sanitize = lc.sanitize;
var enus = 'en_US';
var engb = 'en_GB.UTF-8';

describe('cli-locale:', function() {
  it('should return invalid lang', function(done) {
    var language = '', lang;
    lang = sanitize(language);
    expect(lang).to.be.a('string').that.equals('');
    language = undefined;
    lang = sanitize(language);
    expect(lang).to.be.undefined;
    language = false;
    lang = sanitize(language);
    expect(lang).to.be.a('boolean').that.equals(false);
    language = null;
    lang = sanitize(language);
    expect(lang).to.be.null;
    done();
  });
  it('should return lowercase lang', function(done) {
    var language = enus, lang;
    lang = sanitize(language);
    expect(lang).to.be.a('string').that.equals('en_us');
    done();
  });
  it('should return lang without character encoding', function(done) {
    var language = engb, lang;
    lang = sanitize(language);
    expect(lang).to.be.a('string').that.equals('en_gb');
    done();
  });
  it('should return lang with hyphens', function(done) {
    var language = engb, lang;
    lang = sanitize(language, function(lang) {
      return lang.replace(/_/g, '-');
    });
    expect(lang).to.be.a('string').that.equals('en-gb');
    done();
  });
})
