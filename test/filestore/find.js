'use strict';
var fs = require('fs-extra'),
    q = require('q'),
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
    'filestore.disk#find', function () {
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
        // it should be able to find files from glob patterns
        it(
            'should be able to find files from glob patterns', function () {
                return q.all(
                    [
                        disk.create('folder-glob/match.txt', 'hello romeo'),
                        disk.create('folder-glob/nmatch.txt', 'hello romeo'),
                        disk.create('folder-glob/match.ntxt', 'hello romeo'),
                        disk.create('folder-glob/one/match.txt', 'hello romeo'),
                        disk.create('folder-glob/one/nmatch.txt', 'hello romeo'),
                        disk.create('folder-glob/one/two/match.txt', 'hello romeo'),
                        disk.create('folder-glob/one/two/nmatch.txt', 'hello romeo'),
                        disk.create('folder-glob/one/two/three/match.txt', 'hello romeo'),
                        disk.create('folder-glob/one/very/deep/inside/in/a/folder/match.txt', 'hello romeo')
                    ]
                ).then(
                    function () {
                        return disk.find('folder-glob', '*.txt');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(2);
                        return disk.find('folder-glob', '**/*.txt');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(8);
                        return disk.find('folder-glob', '**/nmatch.txt');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(3);
                    }
                );
            }
        );
        // should not search inside symlinks when given a glob pattern
        it(
            'should not search inside symlinks when given a glob pattern', function () {
                return q.all(
                    [
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
                    ]
                ).then(
                    function () {
                        return q.all(
                            [
                                disk.duplicate(
                                    'folder-watch-sym-link/match.txt',
                                    'folder-watch-sym/folder-watch-sym-link/match.txt',
                                    disk.duplicate.link
                                ),
                                disk.duplicate(
                                    'folder-watch-sym-link',
                                    'folder-watch-sym/folder-watch-sym-link/link',
                                    disk.duplicate.link
                                )
                            ]
                        );
                    }
                ).then(
                    function () {
                        return disk.find('folder-watch-sym', '**/*.txt');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(9);
                    }
                );
            }
        );
    }
);
