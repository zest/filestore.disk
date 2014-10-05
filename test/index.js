'use strict';
// silence the logger
require('base.logger').stop();
var fs = require('fs-extra'),
    outDir = require('path').join(__dirname, './../.out'),
    chai = require('chai'),
    expect = require('chai').expect;
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
// long stack for q
require('q').longStackSupport = true;
var disk = require('../lib').slice(-1)[0](
    require('base.logger')(''),
    {
        baseDir: outDir
    }
);
describe(
    'filestore.disk', function () {
        before(
            function (done) {
                fs.ensureDir(outDir, done);
            }
        );
        after(
            function (done) {
                fs.remove(outDir, done);
            }
        );
        // it should return a module
        it(
            'should return a module', function () {
                expect(disk).not.to.equal(undefined);
            }
        );
        // it should initialize without logger
        it(
            'should initialize without logger', function () {
                var disk = require('../lib').slice(-1)[0](
                    undefined,
                    {
                        baseDir: outDir
                    }
                );
                /*jshint -W030 */
                expect(disk.read).to.exist;
                /*jshint +W030 */
            }
        );
    }
);
