'use strict';
var disk = require('./injector')();
describe('filestore.disk', function () {
    // it should return a module
    it('it should return a module', function () {
        expect(disk).not.toBe(undefined);
    });
});
