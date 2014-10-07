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
    'filestore.disk#router GET', function () {
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
            'should be able to read an empty filestore',
            function () {
                return endToQ(
                    supertest(this.app).get('/disk/').
                        expect('Content-Type', /json/).
                        expect('[]')
                );
            }
        );
        it(
            'should throw an error for an invalid find',
            function () {
                var app = this.app;
                return endToQ(
                    supertest(app).get('/disk/non-existant-folder').
                        query({ find: '**/*.txt' }).
                        expect(500)
                );
            }
        );
        it(
            'should be able to find a list from glob pattern',
            function () {
                var app = this.app;
                return q.all(
                    disk.create('rest-get/one/text1.txt', 'hello romeo'),
                    disk.create('rest-get/two/text1.txt', 'hello romeo'),
                    disk.create('rest-get/three/text1.txt', 'hello romeo'),
                    disk.create('rest-get/text1.txt', 'hello romeo')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/rest-get').
                                query({ find: '**/*.txt' }).
                                expect('Content-Type', /json/).
                                expect(
                                function (response) {
                                    expect(response.body.length).to.equal(4);
                                }
                            )
                        );
                    }
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/rest-get').
                                query({ find: '*.txt' }).
                                expect('Content-Type', /json/).
                                expect(
                                function (response) {
                                    expect(response.body.length).to.equal(1);
                                }
                            )
                        );
                    }
                );
            }
        );
        it(
            'should be able to pack a directory',
            function () {
                var app = this.app;
                var upack;
                return q.all(
                    disk.create('rest-get-pack/one/text1.txt', 'hello romeo'),
                    disk.create('rest-get-pack/two/text1.txt', 'hello romeo'),
                    disk.create('rest-get-pack/three/text1.txt', 'hello romeo'),
                    disk.create('rest-get-pack/text1.txt', 'hello romeo')
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/rest-get-pack').
                                query({ pack: true }).
                                expect('Content-Type', /compressed/).
                                expect('Content-Disposition', /attachment/).
                                parse(
                                function (response, callback) {
                                    upack = disk.unpack('rest-get-unpack', response);
                                    callback(null, null);
                                }
                            )
                        );
                    }
                ).then(
                    function () {
                        return upack;
                    }
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/rest-get-unpack').
                                expect('Content-Type', /json/).
                                expect(
                                function (response) {
                                    expect(response.body.length).to.eql(4);
                                }
                            )
                        );
                    }
                );
            }
        );
        it(
            'should throw an error for an invalid pack',
            function () {
                var app = this.app;
                return endToQ(
                    supertest(app).get('/disk/non-existant-folder').
                        query({ pack: true })
                );
            }
        );
    }
);
