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
    'filestore.disk#router DELETE', function () {
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
            'should be able to delete files',
            function () {
                var app = this.app;
                return q.all(
                    endToQ(
                        supertest(app).post('/disk/folder02/file01.js').
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
