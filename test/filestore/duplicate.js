'use strict';
// silence the logger
require('base.logger').stop();
var fs = require('fs-extra'),
    path = require('path'),
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
    'filestore.disk#duplicate', function () {
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
        // it should be able to create and read symbolic links
        it(
            'should be able to create and read symbolic links', function () {
                return disk.create('folder-four/one/text1.txt', 'hello romeo').then(
                    function () {
                        return disk.duplicate('folder-four/one', 'folder-five/ten', disk.duplicate.link);
                    }
                ).then(
                    function () {
                        return disk.read('folder-five/ten');
                    }
                ).then(
                    function (data) {
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
                    }
                );
            }
        );
        // it should be able to rename files and folders
        it(
            'should be able to rename files and folders', function () {
                return disk.create('folder-rename/one/text1.txt', 'hello romeo').then(
                    function () {
                        return disk.duplicate('folder-rename/one', 'folder-renamed/ten', disk.duplicate.move);
                    }
                ).then(
                    function () {
                        return disk.duplicate(
                            'folder-renamed/ten/text1.txt',
                            'folder-renamed/ten/22.txt',
                            disk.duplicate.move
                        );
                    }
                ).then(
                    function () {
                        return disk.read('folder-renamed/ten');
                    }
                ).then(
                    function (data) {
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
                    }
                );
            }
        );
        // it should be able to copy folders
        it(
            'should be able to copy folders', function () {
                return disk.create('folder-duplicate/one/text1.txt', 'hello romeo').then(
                    function () {
                        return disk.duplicate('folder-duplicate/one', 'folder-duplicate/ten', disk.duplicate.copy);
                    }
                ).then(
                    function () {
                        return disk.read('folder-duplicate/ten');
                    }
                ).then(
                    function (data) {
                        expect(data.length).to.equal(1);
                        expect(data[0].extension).to.equal('.txt');
                        /*jshint -W030 */
                        expect(data[0].created).to.exist;
                        expect(data[0].modified).to.exist;
                        /*jshint +W030 */
                        expect(data[0].name).to.equal('text1.txt');
                        expect(data[0].path).to.equal(path.join('folder-duplicate', 'ten', 'text1.txt'));
                        expect(data[0].type).to.equal('F');
                        expect(data[0].size).to.not.equal(0);
                    }
                );
            }
        );
    }
);
