'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    tar = require('tar'),
    fstream = require('fstream'),
    utils = require('./utils'),
    stream = require('stream');
module.exports = function (config) {
    var logger = config.logger('filestore.disk'),
        fileStore = {
            create: function (relativePath, fileData) {
                if (fileData === undefined) {
                    logger.log('creating directory', relativePath);
                    return q.denodeify(fs.ensureDir)(
                        path.join(config.baseDir, relativePath)
                    );
                }
                if (fileData instanceof stream.Readable) {
                    logger.log('creating file from stream:', relativePath);
                    return fileStore.create(
                        path.dirname(relativePath)
                    ).then(
                        function () {
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
                        }
                    );
                }
                logger.log('creating file from data:', relativePath);
                return q.denodeify(fs.outputFile)(
                    path.join(config.baseDir, relativePath),
                    fileData
                ).then(
                    function () {
                        process.nextTick(function () {
                            logger.log('emitting create event for', relativePath);
                            config.fileEvent.emit('create', relativePath);
                        });
                        return fileData;
                    }
                );
            },
            link: function (originalPath, linkPath) {
                logger.log('linking', linkPath, 'to path', originalPath);
                return utils.getStats(config.baseDir, originalPath).then(function (stats) {
                    return fileStore.create(
                        path.dirname(linkPath)
                    ).then(
                        function () {
                            return stats;
                        }
                    );
                }).then(function (stats) {
                    return q.denodeify(fs.symlink)(
                        path.join(config.baseDir, originalPath),
                        path.join(config.baseDir, linkPath),
                        (stats.type === 'D' ? 'dir' : 'file')
                    );
                });
            },
            read: function (relativePath, encoding) {
                return utils.getStats(config.baseDir, relativePath).then(function (stats) {
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
                    ).then(
                        function (files) {
                            return q.all(
                                files.map(function (oneFile) {
                                    return utils.getStats(config.baseDir, path.join(relativePath, oneFile));
                                })
                            );
                        }
                    );
                });
            },
            getStream: function (relativePath) {
                logger.log('creating read stream', relativePath);
                return fs.createReadStream(path.join(config.baseDir, relativePath));
            },
            find: function (dirPath, globPattern) {
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
            },
            rename: function (oldPath, newPath) {
                logger.log('renaming', oldPath, 'to', newPath);
                return fileStore.create(
                    path.dirname(newPath)
                ).then(
                    function () {
                        return q.denodeify(fs.rename)(
                            path.join(config.baseDir, oldPath),
                            path.join(config.baseDir, newPath)
                        );
                    }
                ).then(
                    function () {
                        process.nextTick(function () {
                            return utils.getStats(config.baseDir, newPath).then(function (stats) {
                                if (stats.type !== 'F') {
                                    return;
                                }
                                config.fileEvent.emit('remove', oldPath);
                                config.fileEvent.emit('create', newPath);
                            });
                        });
                    }
                );
            },
            remove: function (relativePath) {
                logger.log('deleting', relativePath);
                return q.denodeify(fs.remove)(
                    path.join(config.baseDir, relativePath)
                ).then(
                    function () {
                        return process.nextTick(function () {
                            config.fileEvent.emit('remove', relativePath);
                        });
                    }
                );
            },
            serialize: function (relativePath) {
                return fstream.Reader(
                    {
                        path: path.join(config.baseDir, relativePath),
                        type: 'Directory'
                    }
                ).pipe(tar.Pack({ noProprietary: true }));
            },
            deserialize: function (relativePath, readStream) {
                var deferred = q.defer();
                readStream.pipe(tar.Extract(
                    {
                        path: path.join(config.baseDir, relativePath)
                    }
                )).on(
                    'error',
                    function (error) {
                        logger.error('unzipping failed with error');
                        logger.error(error);
                        return deferred.reject(error);
                    }
                ).on(
                    'end',
                    function () {
                        logger.log('successfully deserialized');
                        return deferred.resolve();
                    }
                );
                return deferred.promise;
            },
            watch: function (baseDir, globPattern, eventType, callback) {
                var minimatch = require('minimatch');
                // normalizing params
                if (!callback && !eventType) {
                    // 2 params
                    callback = globPattern;
                    eventType = 'create,remove';
                    globPattern = '**/*';
                } else if (!callback) {
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
                        if (minimatch(path.relative(baseDir, filePath), globPattern)) {
                            callback(filePath, thisEvent);
                        }
                    });
                });
            },
            unwatch: function () {
                config.fileEvent.removeAllListeners('create');
                config.fileEvent.removeAllListeners('remove');
            }
        };
    return fileStore;
};