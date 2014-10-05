'use strict';
// silence the logger
require('base.logger').stop();
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    outDir = require('path').join(__dirname, './../../.out'),
    chai = require('chai'),
    expect = require('chai').expect;
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
// long stack for q
require('q').longStackSupport = true;
var disk = require('../../lib').slice(-1)[0](
    require('base.logger')(''),
    {
        baseDir: outDir
    }
);
describe(
    'filestore.disk#remove', function () {
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
        // it should be able to remove a folder with contents
        it(
            'should be able to remove a folder with contents', function () {
                return disk.create('folder-two/one/text1.txt', 'hello romeo').then(
                    function () {
                        return disk.read('folder-two');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(1);
                        expect(data[0].extension).to.equal('');
                        /*jshint -W030 */
                        expect(data[0].created).to.exist;
                        expect(data[0].modified).to.exist;
                        /*jshint +W030 */
                        expect(data[0].name).to.equal('one');
                        expect(data[0].path).to.equal(path.join('folder-two', 'one'));
                        expect(data[0].type).to.equal('D');
                        return disk.remove('folder-two/one');
                    }
                ).then(
                    function () {
                        return disk.read('folder-two');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(0);
                    }
                );
            }
        );
        // it should be able to create and read a file with contents
        it(
            'should be able to create and read a file with contents', function () {
                return disk.create('folder-three/one/text1.txt', 'hello romeo').then(
                    function () {
                        var fileContentPromise = disk.read('folder-three/one/text1.txt').then(
                            function (stream) {
                                return q.promise(
                                    function (resolve) {
                                        var fileContent = '';
                                        stream.on(
                                            'data',
                                            function (data) {
                                                fileContent = fileContent + data;
                                            }
                                        ).on(
                                            'end',
                                            function () {
                                                resolve(fileContent);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                        return expect(fileContentPromise).to.eventually.become('hello romeo');
                    }
                );
            }
        );
        // it should be able to read and write from stream
        it(
            'should be able to read and write from stream', function () {
                var Readable = require('stream').Readable,
                    util = require('util'),
                    Counter = function (opt) {
                        Readable.call(this, opt);
                        this._max = 1000;
                        this._index = 1;
                    };
                util.inherits(Counter, Readable);
                Counter.prototype._read = function () {
                    this._index = this._index + 1;
                    if (this._index > this._max) {
                        this.push(null);
                    } else {
                        var buf = new Buffer('' + this._index, 'ascii');
                        this.push(buf);
                    }
                };
                return disk.create('streaming-tests/streamed-file.txt', new Counter()).then(
                    function () {
                        return disk.read('streaming-tests/streamed-file.txt');
                    }
                ).then(
                    function (stream) {
                        return disk.create('streaming-tests/streamed-file-new.txt', stream);
                    }
                ).then(
                    function () {
                        return disk.read('streaming-tests');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(2);
                        expect(data[0].size).to.equal(data[1].size);
                    }
                );
            }
        );
        // it should be able to handle stream errors while writing
        it(
            'should be able to handle stream errors while writing', function () {
                var Readable = require('stream').Readable,
                    util = require('util'),
                    Counter = function (opt) {
                        Readable.call(this, opt);
                        this._max = 1000;
                        this._index = 1;
                    };
                util.inherits(Counter, Readable);
                Counter.prototype._read = function () {
                    this._index = this._index + 1;
                    if (this._index > this._max) {
                        this.push(null);
                    } else {
                        var buf = new Buffer('' + this._index, 'ascii');
                        this.push(buf);
                    }
                };
                return expect(disk.create('.', new Counter())).to.be.rejected;
            }
        );
    }
);
