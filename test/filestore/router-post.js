'use strict';
// silence the logger
require('base.logger').stop();
var fs = require('fs-extra'),
    q = require('q'),
    outDir = require('path').join(__dirname, './../../.out'),
    chai = require('chai'),
    express = require('express'),
    expect = require('chai').expect,
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
            'should be able to move a folder',
            function () {
                var app = this.app;
                return q.all(
                    disk.create('rest-post-move/one/text1.txt', 'hello romeo'),
                    disk.create('rest-post-move/two/text1.txt', 'hello romeo'),
                    disk.create('rest-post-move/three/text1.txt', 'hello romeo'),
                    disk.create('rest-post-move/text1.txt', 'hello romeo')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).post('/disk/rest-post-move').
                                query({ move: 'rest-post-move-new' }).
                                expect(200).
                                expect('OK')
                        );
                    }
                ).then(
                    function () {
                        return q.all(
                            endToQ(
                                supertest(app).get('/disk/rest-post-move-new').
                                    expect(
                                    function (response) {
                                        expect(response.body.length).to.eql(4);
                                    }
                                )
                            ),
                            endToQ(
                                supertest(app).get('/disk/rest-post-move').
                                    expect(500)
                            )
                        );
                    }
                );
            }
        );
        it(
            'should be able to copy a folder',
            function () {
                var app = this.app;
                return q.all(
                    disk.create('rest-post-copy/one/text1.txt', 'hello romeo'),
                    disk.create('rest-post-copy/two/text1.txt', 'hello romeo'),
                    disk.create('rest-post-copy/three/text1.txt', 'hello romeo'),
                    disk.create('rest-post-copy/text1.txt', 'hello romeo')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).post('/disk/rest-post-copy').
                                query({ copy: 'rest-post-copy-new' }).
                                expect(200).
                                expect('OK')
                        );
                    }
                ).then(
                    function () {
                        return q.all(
                            endToQ(
                                supertest(app).get('/disk/rest-post-copy-new').
                                    expect(
                                    function (response) {
                                        expect(response.body.length).to.eql(4);
                                    }
                                )
                            ),
                            endToQ(
                                supertest(app).get('/disk/rest-post-copy').
                                    expect(
                                    function (response) {
                                        expect(response.body.length).to.eql(4);
                                    }
                                )
                            )
                        );
                    }
                );
            }
        );
        it(
            'should be able to create symlink to a folder',
            function () {
                var app = this.app;
                return q.all(
                    disk.create('rest-post-link/one/text1.txt', 'hello romeo'),
                    disk.create('rest-post-link/two/text1.txt', 'hello romeo'),
                    disk.create('rest-post-link/three/text1.txt', 'hello romeo'),
                    disk.create('rest-post-link/text1.txt', 'hello romeo')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).post('/disk/rest-post-link').
                                query({ link: 'rest-post-link-new' }).
                                expect(200).
                                expect('OK')
                        );
                    }
                ).then(
                    function () {
                        return q.all(
                            endToQ(
                                supertest(app).get('/disk/rest-post-link-new').
                                    expect(
                                    function (response) {
                                        expect(response.body.length).to.eql(4);
                                    }
                                )
                            ),
                            endToQ(
                                supertest(app).get('/disk/rest-post-link').
                                    expect(
                                    function (response) {
                                        expect(response.body.length).to.eql(4);
                                    }
                                )
                            )
                        );
                    }
                );
            }
        );
        it(
            'should throw an error for invalid operations',
            function () {
                var app = this.app;
                return endToQ(
                    supertest(app).post('/disk/rest-post-link').
                        query({ invalid: 'rest-post-link-new' }).
                        expect(500)
                );
            }
        );
    }
);
