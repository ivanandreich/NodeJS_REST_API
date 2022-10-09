var expect = require('chai').expect;
var help = require('../..');
var define = require('cli-define')
  , prg = define(require('../../package.json'), 'mock-help');

describe('cli-help:', function() {
  it('should create help json', function(done) {
    var res = help.json.call(prg);
    expect(res).to.be.an('object');
    expect(res.name).to.be.a('string');
    expect(res.version).to.be.a('string');
    //console.dir(res);
    done();
  });
})
