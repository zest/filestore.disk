'use strict';
// silence the logger
require('base.logger').stop();
var fs = require('fs-extra'),
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
    'filestore.disk#pack', function () {
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
        // it should be able to unpack and pack folders
        it(
            'should be able to unpack and pack folders', function () {
                return q.all(
                    [
                        disk.create('folder-pack/match.txt', 'hello romeo'),
                        disk.create('folder-pack/nmatch.txt', 'hello romeo'),
                        disk.create('folder-pack/match.ntxt', 'hello romeo'),
                        disk.create('folder-pack/one/match.txt', 'hello romeo'),
                        disk.create('folder-pack/one/nmatch.txt', 'hello romeo'),
                        disk.create('folder-pack/one/two/match.txt', 'hello romeo'),
                        disk.create('folder-pack/one/two/nmatch.txt', 'hello romeo'),
                        disk.create('folder-pack/one/two/three/match.txt', 'hello romeo'),
                        disk.create('folder-pack/one/very/deep/inside/in/a/folder/match.txt', 'hello romeo')
                    ]
                ).then(
                    function () {
                        return disk.pack('folder-pack');
                    }
                ).then(
                    function (stream) {
                        return disk.unpack('folder-unpack', stream);
                    }
                ).then(
                    function () {
                        return disk.find('folder-unpack', '**/*.txt');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(8);
                    }
                ).then(
                    function () {
                        return disk.find('folder-unpack', '*.txt');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(2);
                    }
                );
            }
        );
    }
);
