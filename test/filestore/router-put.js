'use strict';
var fs = require('fs-extra'),
    q = require('q'),
    outDir = require('path').join(__dirname, './../../.out'),
    chai = require('chai'),
    express = require('express'),
    supertest = require('supertest'),
    expect = require('chai').expect;
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
            'should be able to create folders and files',
            function () {
                var app = this.app;
                return q.all(
                    endToQ(
                        supertest(app).put('/disk/folder01').
                            query({ directory: true }).
                            expect(200).
                            expect('OK')
                    ),
                    endToQ(
                        supertest(app).put('/disk/folder01/folder02').
                            query({ directory: true }).
                            expect(200).
                            expect('OK')
                    ),
                    endToQ(
                        supertest(app).put('/disk/folder01/file01.js').
                            send('new file').
                            expect(200).
                            expect('OK')
                    )
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/folder01').
                                expect('Content-Type', /application\/json/).
                                expect(
                                function (response) {
                                    expect(response.body.length).to.eql(2);
                                }
                            )
                        );
                    }
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/folder01/file01.js').
                                expect('Content-Type', /application\/javascript/).
                                expect(
                                function (response) {
                                    expect(response.text).to.eql('new file');
                                }
                            )
                        );
                    }
                );
            }
        );
        //        it(
        //            'should be able to unpack a directory',
        //            function () {
        //                var app = this.app;
        //                return q.all(
        //                    disk.create('rest-put-pack/one/text1.txt', 'hello romeo'),
        //                    disk.create('rest-put-pack/two/text1.txt', 'hello romeo'),
        //                    disk.create('rest-put-pack/three/text1.txt', 'hello romeo'),
        //                    disk.create('rest-put-pack/text1.txt', 'hello romeo')
        //                ).then(
        //                    function () {
        //                        return endToQ(
        //                            supertest(app).get('/disk/rest-put-pack?pack=true').
        //                                expect('Content-Type', /compressed/).
        //                                expect('Content-Disposition', /attachment/).expect(
        //                                function (response) {
        //                                    console.log(response.files);
        //                                    txt = response.text;
        //                                }
        //                            )
        //                        );
        //                    }
        //                ).then(
        //                    function () {
        //                        return endToQ(
        //                            supertest(app).put('/disk/rest-put-uunack?unpack=true').
        //                                send(txt).
        //                                expect(200).
        //                                expect('OK')
        //                        );
        //                    }
        //                ).then(
        //                    function () {
        //                        return endToQ(
        //                            supertest(app).get('/disk/rest-put-unpack').expect('Content-Type', /json/).expect(
        //                                function (response) {
        //                                    expect(response.body.length).to.eql(3);
        //                                }
        //                            )
        //                        );
        //                    }
        //                );
        //            }
        //        );
    }
);
