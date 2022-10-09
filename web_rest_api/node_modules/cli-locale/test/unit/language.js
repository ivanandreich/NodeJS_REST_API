var expect = require('chai').expect;
var spanish = 'es';
var lc = require('../..'), find = lc.find;

describe('cli-locale:', function() {
  it('should return correct default language', function(done) {
    lc(spanish);
    var lang = lc.language;
    expect(lang).to.be.a('string').that.equals(spanish);
    done();
  });
})
