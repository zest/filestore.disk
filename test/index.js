'use strict';
var disk = require('../lib'),
    expect = require('chai').expect;
describe('filestore.disk', function () {
    // it should return a module
    it('it should return a module', function () {
        expect(disk).not.to.equal(undefined);
    });
});
