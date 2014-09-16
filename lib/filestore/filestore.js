'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    targz = require('tar.gz'),
    utils = require('./utils'),
    os = require('os'),
    config = require('./config');
module.exports.create = function (relativePath, fileData) {
    if (!fileData) {
        return q.denodeify(fs.ensureDir)(
            path.join(config.baseDir, relativePath)
        );
    }
    return q.denodeify(fs.outputFile)(
        path.join(config.baseDir, relativePath),
        fileData
    ).then(function () {
        process.nextTick(function () {
            config.fileEvent.emit('create', relativePath);
        });
        return fileData;
    });
};
module.exports.read = function (relativePath) {
    return utils.getStats(relativePath).then(function (stats) {
        if (stats.type !== 'D') {
            return q.denodeify(fs.readFile)(
                path.join(config.baseDir, relativePath)
            );
        }
        return q.denodeify(fs.readdir)(
            path.join(config.baseDir, relativePath)
        ).then(function (files) {
            return q.all(
                files.map(function (oneFile) {
                    return utils.getStats(path.join(relativePath, oneFile));
                })
            );
        });
    });
};
module.exports.find = function (dirPath, globPattern) {
    var fileList = [],
        deferred = q.defer(),
        minimatch = require('minimatch'),
        finder = require('findit')(
            path.join(config.baseDir, dirPath)
        );
    finder.on('path', function (filePath, stat) {
        var relativepath = path.relative(config.baseDir, filePath);
        if (minimatch(relativepath, globPattern)) {
            fileList.push(utils.normalizeStats(stat, relativepath));
        }
    });
    finder.on('end', function () {
        deferred.resolve(fileList);
    });
    finder.on('error', function (error) {
        deferred.reject(error);
    });
    return deferred.promise;
};
module.exports.rename = function (oldPath, newPath) {
    return q.denodeify(fs.rename)(
        path.join(config.baseDir, oldPath),
        path.join(config.baseDir, newPath)
    ).then(function () {
        process.nextTick(function () {
            return utils.getStats(newPath).then(function (stats) {
                if (stats.type !== 'F') {
                    return;
                }
                config.fileEvent.emit('remove', oldPath);
                config.fileEvent.emit('create', newPath);
            });
        });
    });
};
module.exports.remove = function (relativePath) {
    return q.denodeify(fs.remove)(
        path.join(config.baseDir, relativePath)
    ).then(function () {
        process.nextTick(function() {
            config.fileEvent.emit('remove', relativePath);
        });
    });
};
module.exports.export = function (dirPath) {
    var tgz = new targz(),
        zipStore = path.join(os.tmpdir(), 'export-' + Math.floor(Math.random()*999999) + 'tar.gz');
    return q.nbind(tgz.compress, tgz)(
        path.join(config.baseDir, dirPath),
        zipStore
    ).then(function () {
        return fs.createReadStream(zipStore);
    });
};
module.exports.import = function (dirPath, readStream) {
    var tgz = new targz(),
        zipStore = path.join(os.tmpdir(), 'import-' + Math.floor(Math.random()*999999) + 'tar.gz'),
        zipStream = fs.createWriteStream(zipStore),
        deferred = q.defer();
    readStream.pipe(zipStream);
    zipStream.on('error', function (error) {
        return deferred.reject(error);
    });
    zipStream.on('finish', function () {
        tgz.extract(
            zipStore,
            path.join(config.baseDir, dirPath),
            function(error){
                if(error) {
                    return deferred.reject(error);
                }
                return deferred.resolve();
            }
        );
    });
    return deferred.promise;
};
module.exports.watch = function (baseDir, globPattern, eventType, callback) {
    var minimatch = require('minimatch');
    // normalizing params
    if ( !callback && !eventType) {
        // 2 params
        callback = globPattern;
        eventType = 'create,remove';
        globPattern = '**/*';
    } else if(!callback) {
        // 3 params
        callback = eventType;
        eventType = 'create,remove';
        if (globPattern === 'create' || globPattern === 'remove') {
            eventType = globPattern;
            globPattern = '**/*';
        }
    }
    eventType.split(',').forEach(function (thisEvent) {
        config.fileEvent.on(thisEvent, function (filePath) {
            if(minimatch(filePath, globPattern)) {
                callback(filePath, thisEvent);
            }
        });
    });
};
