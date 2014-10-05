'use strict';
// silence the logger
require('base.logger').stop();
var fs = require('fs-extra'),
    q = require('q'),
    outDir = require('path').join(__dirname, './../../.out'),
    chai = require('chai'),
    sinon = require('sinon'),
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
    'filestore.disk#watch', function () {
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
        // it should be able to watch files for changes
        it(
            'should be able to watch files for changes', function () {
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
                return q.all(
                    [
                        disk.create('folder-watch/match.txt', 'hello romeo'),
                        disk.create('folder-watch/nmatch.txt', 'hello romeo'),
                        disk.create('folder-watch/match.ntxt', 'hello romeo'),
                        disk.create('folder-watch/one/match.txt', 'hello romeo'),
                        disk.create('folder-watch/one/nmatch.txt', 'hello romeo'),
                        disk.create('folder-watch/one/two/match.txt', 'hello romeo'),
                        disk.create('folder-watch/one/two/nmatch.txt', 'hello romeo'),
                        disk.create('folder-watch/one/two/three/match.txt', 'hello romeo'),
                        disk.create('folder-watch/one/very/deep/inside/in/a/folder/match.txt', 'hello romeo')
                    ]
                ).then(
                    function () {
                        return q.promise(
                            function (resolve) {
                                process.nextTick(
                                    function () {
                                        expect(spy1).to.have.callCount(2);
                                        expect(spy11).to.have.callCount(2);
                                        expect(spy2).to.have.callCount(8);
                                        expect(spy21).to.have.callCount(0);
                                        expect(spy3).to.have.callCount(9);
                                        expect(spy31).to.have.callCount(9);
                                        resolve();
                                    }
                                );
                            }
                        );
                    }
                ).then(
                    function () {
                        return q.all(
                            [
                                disk.remove('folder-watch/one/very/deep/inside/in/a/folder/match.txt'),
                                disk.duplicate(
                                    'folder-watch/one/two/three/match.txt',
                                    'folder-watch/one/two/three/match.ntxt',
                                    disk.duplicate.move
                                ),
                                disk.duplicate(
                                    'folder-watch/one/match.txt',
                                    'folder-watch/one-renamed/match.txt',
                                    disk.duplicate.copy
                                )
                            ]
                        );
                    }
                ).then(
                    function () {
                        return q.promise(
                            function (resolve) {
                                process.nextTick(
                                    function () {
                                        expect(spy1).to.have.callCount(2);
                                        expect(spy11).to.have.callCount(2);
                                        expect(spy2).to.have.callCount(11);
                                        expect(spy21).to.have.callCount(2);
                                        expect(spy3).to.have.callCount(13);
                                        expect(spy31).to.have.callCount(11);
                                        expect(spy21).to.have.been.calledWith(
                                            'folder-watch/one/very/deep/inside/in/a/folder/match.txt',
                                            'remove'
                                        );
                                        disk.unwatch();
                                        resolve();
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);
