'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    outDir = require('path').join(__dirname, './../.out'),
    chai = require('chai'),
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
            /*jshint -W030 */
            expect(data[0].modified).to.eql(data[0].created);
            expect(data[0].name).to.equal('one');
            expect(data[0].path).to.equal(path.join('folder-two', 'one'));
            expect(data[0].type).to.equal('D');
            return disk.read('folder-two/one');
        }).then(function (data) {
            expect(data.length).to.equal(1);
            expect(data[0].extension).to.equal('.txt');
            /*jshint -W030 */
            expect(data[0].created).to.exist;
            /*jshint -W030 */
            expect(data[0].modified).to.eql(data[0].created);
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
            /*jshint -W030 */
            expect(data[0].modified).to.eql(data[0].created);
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
            /*jshint -W030 */
            expect(data[0].modified).to.eql(data[0].created);
            expect(data[0].name).to.equal('22.txt');
            expect(data[0].path).to.equal(path.join('folder-renamed', 'ten', '22.txt'));
            expect(data[0].type).to.equal('F');
            expect(data[0].size).to.not.equal(0);
        });
    });
});
