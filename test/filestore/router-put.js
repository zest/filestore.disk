'use strict';
var fs = require('fs-extra'),
    q = require('q'),
    outDir = require('path').join(__dirname, './../../.out'),
    chai = require('chai'),
    express = require('express'),
    expect = require('chai').expect,
    supertest = require('supertest');
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
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
    'filestore.disk#router PUT', function () {
        before(
            function (done) {
                require('base.logger').stop();
                this.app = express();
                this.app.use('/disk', disk.router);
                this.app.use(
                    '*',
                    /*jshint unused: true */
                    function(err, req, res, next){
                        res.status(500).end();
                    }
                    /*jshint unused: false */
                );
                fs.ensureDir(outDir, done);
            }
        );
        after(
            function (done) {
                fs.remove(outDir, done);
                require('base.logger').start();
            }
        );
        it(
            'should be able to move a folder',
            function () {
                var app = this.app;
                return q.all(
                    disk.create('rest-put-move/one/text1.txt', 'hello romeo'),
                    disk.create('rest-put-move/two/text1.txt', 'hello romeo'),
                    disk.create('rest-put-move/three/text1.txt', 'hello romeo'),
                    disk.create('rest-put-move/text1.txt', 'hello romeo')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).put('/disk/rest-put-move').
                                query({ move: 'rest-put-move-new' }).
                                expect(200).
                                expect('OK')
                        );
                    }
                ).then(
                    function () {
                        return q.all(
                            endToQ(
                                supertest(app).get('/disk/rest-put-move-new').
                                    expect(
                                    function (response) {
                                        expect(response.body.length).to.eql(4);
                                    }
                                )
                            ),
                            endToQ(
                                supertest(app).get('/disk/rest-put-move').
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
                    disk.create('rest-put-copy/one/text1.txt', 'hello romeo'),
                    disk.create('rest-put-copy/two/text1.txt', 'hello romeo'),
                    disk.create('rest-put-copy/three/text1.txt', 'hello romeo'),
                    disk.create('rest-put-copy/text1.txt', 'hello romeo')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).put('/disk/rest-put-copy').
                                query({ copy: 'rest-put-copy-new' }).
                                expect(200).
                                expect('OK')
                        );
                    }
                ).then(
                    function () {
                        return q.all(
                            endToQ(
                                supertest(app).get('/disk/rest-put-copy-new').
                                    expect(
                                    function (response) {
                                        expect(response.body.length).to.eql(4);
                                    }
                                )
                            ),
                            endToQ(
                                supertest(app).get('/disk/rest-put-copy').
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
                    disk.create('rest-put-link/one/text1.txt', 'hello romeo'),
                    disk.create('rest-put-link/two/text1.txt', 'hello romeo'),
                    disk.create('rest-put-link/three/text1.txt', 'hello romeo'),
                    disk.create('rest-put-link/text1.txt', 'hello romeo')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).put('/disk/rest-put-link').
                                query({ link: 'rest-put-link-new' }).
                                expect(200).
                                expect('OK')
                        );
                    }
                ).then(
                    function () {
                        return q.all(
                            endToQ(
                                supertest(app).get('/disk/rest-put-link-new').
                                    expect(
                                    function (response) {
                                        expect(response.body.length).to.eql(4);
                                    }
                                )
                            ),
                            endToQ(
                                supertest(app).get('/disk/rest-put-link').
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
                    supertest(app).put('/disk/rest-put-link').
                        query({ invalid: 'rest-put-link-new' }).
                        expect(500)
                );
            }
        );
    }
);
