'use strict';
var fs = require('fs-extra'),
    outDir = require('path').join(__dirname, './../../.out'),
    chai = require('chai'),
    expect = require('chai').expect;
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
var disk = require('../../lib').slice(-1)[0](
    require('base.logger')(''),
    {
        baseDir: outDir
    }
);
describe(
    'filestore.disk#unpack', function () {
        before(
            function (done) {
                fs.ensureDir(outDir, done);
                require('base.logger').stop();
            }
        );
        after(
            function (done) {
                fs.remove(outDir, done);
                require('base.logger').start();
            }
        );
        // it should be able to handle invalid streams for unpacking
        it(
            'should be able to handle invalid streams for unpacking', function () {
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
                return expect(disk.unpack('folder-unpack', new Counter())).to.be.rejected;
                /*jshint +W030 */
            }
        );
    }
);
