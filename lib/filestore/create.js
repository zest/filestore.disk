'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    stream = require('stream');
module.exports = function (config) {
    var logger = config.logger('filestore.disk');
    return function create(relativePath, fileData) {
        if (fileData === undefined) {
            logger.log('creating directory', relativePath);
            return q.denodeify(fs.ensureDir)(
                path.join(config.baseDir, relativePath)
            );
        }
        if (fileData instanceof stream.Readable) {
            logger.log('creating file from stream:', relativePath);
            return create(
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
    };
}