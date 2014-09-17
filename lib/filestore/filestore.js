'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    targz = require('tar.gz'),
    utils = require('./utils'),
    os = require('os'),
    stream = require('stream'),
    config = require('./config'),
    logger = config.logger('filestore.disk');
module.exports.create = function (relativePath, fileData) {
    if (fileData === undefined) {
        logger.log('creating directory', relativePath);
        return q.denodeify(fs.ensureDir)(
            path.join(config.baseDir, relativePath)
        );
    }
    if(fileData instanceof stream.Readable) {
        logger.log('creating file from stream:', relativePath);
        return module.exports.create(
            path.dirname(relativePath)
        ).then(function () {
            var deferred = q.defer(),
                writeStream = fs.createWriteStream(path.join(config.baseDir, relativePath));
            writeStream.on('error', function (error) {
                return deferred.reject(error);
            });
            writeStream.on('finish', function () {
                return deferred.resolve();
            });
            fileData.pipe(writeStream);
            return deferred.promise;
        });
    }
    logger.log('creating file from data:', relativePath);
    return q.denodeify(fs.outputFile)(
        path.join(config.baseDir, relativePath),
        fileData
    ).then(function () {
        process.nextTick(function () {
            logger.log('emitting create event for', relativePath);
            config.fileEvent.emit('create', relativePath);
        });
        return fileData;
    });
};
module.exports.link = function (originalPath, linkPath) {
    logger.log('linking', linkPath, 'to path', originalPath);
    return utils.getStats(originalPath).then(function (stats) {
        return module.exports.create(
            path.dirname(linkPath)
        ).then(function () {
            return stats;
        });
    }).then(function (stats) {
        return q.denodeify(fs.symlink)(
            path.join(config.baseDir, originalPath),
            path.join(config.baseDir, linkPath),
            (stats.type === 'D' ? 'dir': 'file')
        );
    });
};
module.exports.read = function (relativePath, encoding) {
    return utils.getStats(relativePath).then(function (stats) {
        if (stats.type !== 'D') {
            logger.log('reading file at', relativePath);
            return q.denodeify(fs.readFile)(
                path.join(config.baseDir, relativePath),
                {
                    encoding: encoding
                }
            );
        }
        logger.log('reading directory at', relativePath);
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
module.exports.getStream = function (relativePath) {
    logger.log('creating read stream', relativePath);
    return fs.createReadStream(path.join(config.baseDir, relativePath));
};
module.exports.find = function (dirPath, globPattern) {
    var fileList = [],
        deferred = q.defer(),
        minimatch = require('minimatch'),
        findPath = path.join(config.baseDir, dirPath),
        finder = require('findit')(findPath);
    logger.log('reading files at', dirPath, 'with pattern', globPattern);
    finder.on('path', function (filePath, stat) {
        var relativepath = path.relative(findPath, filePath);
        logger.log('matching ', relativepath, 'with pattern', globPattern);
        if (minimatch(relativepath, globPattern)) {
            logger.log('\tmatch!');
            fileList.push(utils.normalizeStats(stat, path.join(dirPath, relativepath)));
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
    logger.log('renaming', oldPath, 'to', newPath);
    return module.exports.create(
        path.dirname(newPath)
    ).then(function () {
        return q.denodeify(fs.rename)(
            path.join(config.baseDir, oldPath),
            path.join(config.baseDir, newPath)
        );
    }).then(function () {
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
    logger.log('deleting', relativePath);
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
        zipStore = path.join(os.tmpdir(), 'export-' + Math.floor(Math.random()*999999) + '.tar.gz');
    logger.log('exporting', dirPath);
    return q.nbind(tgz.compress, tgz)(
        path.join(config.baseDir, dirPath),
        zipStore
    ).then(function () {
        logger.log('exported to', zipStore);
        return fs.createReadStream(zipStore);
    });
};
module.exports.import = function (dirPath, readStream) {
    var tgz = new targz(),
        zipStore = path.join(os.tmpdir(), 'import-' + Math.floor(Math.random()*999999) + '.tar.gz'),
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
            logger.log(thisEvent, 'captured on', filePath);
            logger.log('matching with pattern', globPattern);
            if(minimatch(path.relative(baseDir, filePath), globPattern)) {
                callback(filePath, thisEvent);
            }
        });
    });
};
