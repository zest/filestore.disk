'use strict';
/**
 * @fileOverview The filestore-disk/create module returns the {@link module:filestore-disk/create~Create|create}
 * function.
 * @module filestore-disk/create
 * @requires fs-extra
 * @requires path
 * @requires q
 * @requires stream
 */
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    stream = require('stream');
/**
 * Returns a create function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {module:filestore-disk/create~Create} the create function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/create');
    /**
     * The create function creates (or overrides) a file or a directory at the path specified. if the fileData variable
     * is passed to the function, a file is created. Otherwise, a directory is created. If the parent path at which the
     * file or directory is to be created does not exist, it is also created.
     * @param {String} relativePath - the path at which the file or directory has to be created
     * @param {String|Buffer|Readable} [fileData] - the file data to be used
     * @returns {q} A promise that gets resolved when the file or directory is created
     * @callback module:filestore-disk/create~Create
     */
    return function create(relativePath, fileData) {
        if (arguments.length === 1) {
            // if fileData is not present, we create a directory
            logger.log('creating directory', relativePath);
            return q.denodeify(fs.ensureDir)(
                path.join(config.baseDir, relativePath)
            );
        }
        if (fileData instanceof stream.Readable) {
            // if fileData is a readable stream, we write it to a file at the path
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
        // if fileData is a Buffer ot a string, we directly output it into the file
        logger.log('creating file from data:', relativePath);
        return q.denodeify(fs.outputFile)(
            path.join(config.baseDir, relativePath),
            fileData
        ).then(
            function () {
                // finally, emit the create event asynchronously
                process.nextTick(function () {
                    logger.log('emitting create event for', relativePath);
                    config.fileEvent.emit('create', relativePath);
                });
                return fileData;
            }
        );
    };
};
