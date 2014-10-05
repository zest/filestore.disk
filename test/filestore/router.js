'use strict';
// silence the logger
// require('base.logger').stop();
var fs = require('fs-extra'),
//    path = require('path'),
    q = require('q'),
    outDir = require('path').join(__dirname, './../../.out'),
    chai = require('chai'),
    express = require('express'),
    supertest = require('supertest'),
//    sinon = require('sinon'),
    expect = require('chai').expect;
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
    'filestore.disk#router', function () {
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
            'should be able to create folders and files',
            function () {
                var app = this.app;
                return q.all(
                    endToQ(
                        supertest(app).put('/disk/folder01').
                            expect(200).
                            expect('OK')
                    ),
                    endToQ(
                        supertest(app).put('/disk/folder01/folder02').
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
        it(
            'should be able to delete files',
            function () {
                var app = this.app;
                return q.all(
                    endToQ(
                        supertest(app).put('/disk/folder02/file01.js').
                            send('new file').
                            expect(200).
                            expect('OK')
                    )
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/folder02').
                                expect('Content-Type', /application\/json/).
                                expect(
                                function (response) {
                                    expect(response.body.length).to.eql(1);
                                }
                            )
                        );
                    }
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).delete('/disk/folder02/file01.js').
                                expect(200).
                                expect('OK')
                        );
                    }
                ).then(
                    function () {
                        return endToQ(
                            supertest(app).get('/disk/folder02').
                                expect('Content-Type', /application\/json/).
                                expect(
                                function (response) {
                                    expect(response.body.length).to.eql(0);
                                }
                            )
                        );
                    }
                );
            }
        );
    }
);