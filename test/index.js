'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    expect = require('chai').expect,
    outDir = path.join(__dirname, './../.out');
describe('filestore.disk', function () {
    beforeEach(function (done) {
        this.disk = require('../lib').pop()(require('base.logger'), {
            baseDir: outDir
        });
        fs.ensureDir(outDir, done);
    });
    afterEach(function (done) {
        fs.remove(outDir, done);
    });
    // it should return a module
    it('should return a module', function () {
        expect(this.disk).not.to.equal(undefined);
    });
    // it should be able to create a folder
    it('should be able to create a folder');
});
