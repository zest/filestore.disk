'use strict';
// silence the logger
// require('base.logger').stop();
var fs = require('fs-extra'),
    q = require('q'),
    outDir = require('path').join(__dirname, './../../.out'),
    chai = require('chai'),
    express = require('express'),
    supertest = require('supertest');
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
// long stack for q
require('q').longStackSupport = true;
var disk = require('./../../lib/index').slice(-1)[0](
    require('base.logger')(''),
    {
        baseDir: outDir
    }
);
var endToQ = function (end) {
    var deferred = q.defer();
    end.end(deferred.makeNodeResolver());
    return deferred.promise;
};
describe(
    'filestore.disk#router POST', function () {
        before(
            function (done) {
                this.app = express();
                this.app.use('/disk', disk.router);
                fs.ensureDir(outDir, done);
            }
        );
        after(
            function (done) {
                fs.remove(outDir, done);
            }
        );
        it(
            'should be able to move a file', function () {
                var app = this.app;
                return endToQ(
                    supertest(app).put('/disk/folder01?directory=true').
                        expect(200).
                        expect('OK')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/folder01').
                                expect('[]')
                        );
                    }
                );
            }
        );
        it('should be able to move a folder');
        it('should be able to copy a folder');
        it('should be able to create symlink to a folder');
    }
);
