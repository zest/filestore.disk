'use strict';
// silence the logger
require('base.logger').configure([]);
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    outDir = require('path').join(__dirname, './../.out'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = require('chai').expect;
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
// long stack for q
require('q').longStackSupport = true;
var disk = require('../lib').slice(-1)[0](
    require('base.logger'),
    {
        baseDir: outDir
    }
);
describe('filestore.disk', function () {
    before(function (done) {
        fs.ensureDir(outDir, done);
    });
    after(function (done) {
        fs.remove(outDir, done);
    });
    // it should return a module
    it('should return a module', function () {
        expect(disk).not.to.equal(undefined);
    });
    // it should initialize without logger
    it('should initialize without logger', function () {
        var disk = require('../lib').slice(-1)[0](
            undefined,
            {
                baseDir: outDir
            }
        );
        /*jshint -W030 */
        expect(disk.read).to.exist;
        /*jshint +W030 */
    });
    // it should be able to create and read an empty folder
    it('should be able to create and read an empty folder', function () {
        return disk.create('folder-one').then(function () {
            return expect(disk.read('folder-one')).to.eventually.become([]);
        });
    });
    // it should be able to create and read a folder with contents
    it('should be able to create and read a folder with contents', function () {
        return disk.create('folder-two/one/text1.txt', 'hello romeo').then(function () {
            return disk.read('folder-two');
        }).then(function (data) {
            expect(data.length).to.equal(1);
            expect(data[0].extension).to.equal('');
            /*jshint -W030 */
            expect(data[0].created).to.exist;
            expect(data[0].modified).to.exist;
            /*jshint +W030 */
            expect(data[0].name).to.equal('one');
            expect(data[0].path).to.equal(path.join('folder-two', 'one'));
            expect(data[0].type).to.equal('D');
            return disk.read('folder-two/one');
        }).then(function (data) {
            expect(data.length).to.equal(1);
            expect(data[0].extension).to.equal('.txt');
            /*jshint -W030 */
            expect(data[0].created).to.exist;
            expect(data[0].modified).to.exist;
            /*jshint +W030 */
            expect(data[0].name).to.equal('text1.txt');
            expect(data[0].path).to.equal(path.join('folder-two', 'one', 'text1.txt'));
            expect(data[0].type).to.equal('F');
            expect(data[0].size).to.not.equal(0);
        });
    });
    // it should be able to create and read a file with contents
    it('should be able to create and read a file with contents', function () {
        return disk.create('folder-three/one/text1.txt', 'hello romeo').then(function () {
            return expect(disk.read('folder-three/one/text1.txt', 'utf8')).to.eventually.become('hello romeo');
        });
    });
    // it should be able to create and read symbolic links
    it('should be able to create and read symbolic links', function () {
        return disk.create('folder-four/one/text1.txt', 'hello romeo').then(function () {
            return disk.link('folder-four/one', 'folder-five/ten');
        }).then(function () {
            return disk.read('folder-five/ten');
        }).then(function (data) {
            expect(data.length).to.equal(1);
            expect(data[0].extension).to.equal('.txt');
            /*jshint -W030 */
            expect(data[0].created).to.exist;
            expect(data[0].modified).to.exist;
            /*jshint +W030 */
            expect(data[0].name).to.equal('text1.txt');
            expect(data[0].path).to.equal(path.join('folder-five', 'ten', 'text1.txt'));
            expect(data[0].type).to.equal('F');
            expect(data[0].size).to.not.equal(0);
        });
    });
    // it should be able to rename files and folders
    it('should be able to rename files and folders', function () {
        return disk.create('folder-rename/one/text1.txt', 'hello romeo').then(function () {
            return disk.rename('folder-rename/one', 'folder-renamed/ten');
        }).then(function () {
            return disk.rename('folder-renamed/ten/text1.txt', 'folder-renamed/ten/22.txt');
        }).then(function () {
            return disk.read('folder-renamed/ten');
        }).then(function (data) {
            expect(data.length).to.equal(1);
            expect(data[0].extension).to.equal('.txt');
            /*jshint -W030 */
            expect(data[0].created).to.exist;
            expect(data[0].modified).to.exist;
            /*jshint +W030 */
            expect(data[0].name).to.equal('22.txt');
            expect(data[0].path).to.equal(path.join('folder-renamed', 'ten', '22.txt'));
            expect(data[0].type).to.equal('F');
            expect(data[0].size).to.not.equal(0);
        });
    });
    // it should be able to find files from glob patterns
    it('should be able to find files from glob patterns', function () {
        return q.all([
            disk.create('folder-glob/match.txt', 'hello romeo'),
            disk.create('folder-glob/nmatch.txt', 'hello romeo'),
            disk.create('folder-glob/match.ntxt', 'hello romeo'),
            disk.create('folder-glob/one/match.txt', 'hello romeo'),
            disk.create('folder-glob/one/nmatch.txt', 'hello romeo'),
            disk.create('folder-glob/one/two/match.txt', 'hello romeo'),
            disk.create('folder-glob/one/two/nmatch.txt', 'hello romeo'),
            disk.create('folder-glob/one/two/three/match.txt', 'hello romeo'),
            disk.create('folder-glob/one/very/deep/inside/in/a/folder/match.txt', 'hello romeo')
        ]).then(function () {
            return disk.find('folder-glob', '*.txt');
        }).then(function (data) {
            expect(data.length).to.equal(2);
            return disk.find('folder-glob', '**/*.txt');
        }).then(function (data) {
            expect(data.length).to.equal(8);
            return disk.find('folder-glob', '**/nmatch.txt');
        }).then(function (data) {
            expect(data.length).to.equal(3);
        });
    });
    // it should be able to watch files for changes
    it('should be able to watch files for changes', function () {
        var spy1 = sinon.spy(),
            spy2 = sinon.spy(),
            spy3 = sinon.spy(),
            spy11 = sinon.spy(),
            spy21 = sinon.spy(),
            spy31 = sinon.spy();
        disk.watch('folder-watch', '*.txt', spy1);
        disk.watch('folder-watch', '*.txt', 'create', spy11);
        disk.watch('folder-watch', '**/*.txt', spy2);
        disk.watch('folder-watch', '**/*.txt', 'remove', spy21);
        disk.watch('folder-watch', spy3);
        disk.watch('folder-watch', 'create', spy31);
        return q.all([
            disk.create('folder-watch/match.txt', 'hello romeo'),
            disk.create('folder-watch/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch/match.ntxt', 'hello romeo'),
            disk.create('folder-watch/one/match.txt', 'hello romeo'),
            disk.create('folder-watch/one/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch/one/two/match.txt', 'hello romeo'),
            disk.create('folder-watch/one/two/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch/one/two/three/match.txt', 'hello romeo'),
            disk.create('folder-watch/one/very/deep/inside/in/a/folder/match.txt', 'hello romeo')
        ]).then(function () {
            return q.promise(function (resolve) {
                process.nextTick(function () {
                    expect(spy1).to.have.callCount(2);
                    expect(spy11).to.have.callCount(2);
                    expect(spy2).to.have.callCount(8);
                    expect(spy21).to.have.callCount(0);
                    expect(spy3).to.have.callCount(9);
                    expect(spy31).to.have.callCount(9);
                    resolve();
                });
            });
        }).then(function () {
            return q.all([
                disk.remove('folder-watch/one/very/deep/inside/in/a/folder/match.txt'),
                disk.rename('folder-watch/one/two/three/match.txt', 'folder-watch/one/two/three/match.ntxt'),
                disk.rename('folder-watch/one/match.txt', 'folder-watch/one-renamed/match.txt')
            ]);
        }).then(function () {
            return q.promise(function (resolve) {
                process.nextTick(function () {
                    expect(spy1).to.have.callCount(2);
                    expect(spy11).to.have.callCount(2);
                    expect(spy2).to.have.callCount(12);
                    expect(spy21).to.have.callCount(3);
                    expect(spy3).to.have.callCount(14);
                    expect(spy31).to.have.callCount(11);
                    expect(spy21).to.have.been.calledWith(
                        'folder-watch/one/very/deep/inside/in/a/folder/match.txt',
                        'remove'
                    );
                    disk.unwatch();
                    resolve();
                });
            });
        });
    });
    // it should be able to deserialize and serialize folders
    it('should be able to deserialize and serialize folders', function () {
        return q.all([
            disk.create('folder-serialize/match.txt', 'hello romeo'),
            disk.create('folder-serialize/nmatch.txt', 'hello romeo'),
            disk.create('folder-serialize/match.ntxt', 'hello romeo'),
            disk.create('folder-serialize/one/match.txt', 'hello romeo'),
            disk.create('folder-serialize/one/nmatch.txt', 'hello romeo'),
            disk.create('folder-serialize/one/two/match.txt', 'hello romeo'),
            disk.create('folder-serialize/one/two/nmatch.txt', 'hello romeo'),
            disk.create('folder-serialize/one/two/three/match.txt', 'hello romeo'),
            disk.create('folder-serialize/one/very/deep/inside/in/a/folder/match.txt', 'hello romeo')
        ]).then(function () {
            return disk.serialize('folder-serialize');
        }).then(function (stream) {
            return disk.deserialize('folder-deserialize', stream);
        }).then(function () {
            return disk.find('folder-deserialize', '**/*.txt');
        }).then(function (data) {
            expect(data.length).to.equal(8);
        });
    });
    // should not search inside symlinks when given a glob pattern
    it('should not search inside symlinks when given a glob pattern', function () {
        return q.all([
            disk.create('folder-watch-sym/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch-sym/match.ntxt', 'hello romeo'),
            disk.create('folder-watch-sym/one/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym/one/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch-sym/one/two/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym/one/two/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch-sym/one/two/three/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym/one/very/deep/inside/in/a/folder/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym-link/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym-link/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch-sym-link/match.ntxt', 'hello romeo'),
            disk.create('folder-watch-sym-link/one/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym-link/one/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch-sym-link/one/two/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym-link/one/two/nmatch.txt', 'hello romeo'),
            disk.create('folder-watch-sym-link/one/two/three/match.txt', 'hello romeo'),
            disk.create('folder-watch-sym-link/one/very/deep/inside/in/a/folder/match.txt', 'hello romeo')
        ]).then(function () {
            return q.all([
                disk.link('folder-watch-sym-link/match.txt', 'folder-watch-sym/folder-watch-sym-link/match.txt'),
                disk.link('folder-watch-sym-link', 'folder-watch-sym/folder-watch-sym-link/link')
            ]);
        }).then(function () {
            return disk.find('folder-watch-sym', '**/*.txt');
        }).then(function (data) {
            expect(data.length).to.equal(9);
        });
    });
    // it should be able to deserialize and serialize files
    it('should be able to read and write from stream', function () {
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
        return disk.create('streaming-tests/streamed-file.txt', new Counter()).then(function () {
            return disk.getStream('streaming-tests/streamed-file.txt');
        }).then(function (stream) {
            return disk.create('streaming-tests/streamed-file-new.txt', stream);
        }).then(function () {
            return disk.read('streaming-tests');
        }).then(function (data) {
            expect(data.length).to.equal(2);
            expect(data[0].size).to.equal(data[1].size);
        });
    });
    // it should be able to handle stream errors while writing
    it('should be able to handle stream errors while writing', function () {
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
    });
    // it should be able to handle invalid streams for deserialization
    it('should be able to handle invalid streams for deserialization', function () {
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
        /*jshint -W030 */
        return expect(disk.deserialize('folder-deserialize', new Counter())).to.be.rejected;
        /*jshint +W030 */
    });
});
