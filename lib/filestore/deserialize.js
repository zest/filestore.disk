'use strict';
/**
 * @fileOverview The filestore-disk/deserialize module returns the {@link FileStoreFunctions#deserialize} function.
 * @module filestore-disk/deserialize
 * @requires {@link external:path}
 * @requires {@link external:q}
 * @requires {@link external:tar}
 */
var path = require('path'),
    q = require('q'),
    tar = require('tar'),
    zlib = require('zlib');
/**
 * Returns a deserialize function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#deserialize} the deserialize function
 */
module.exports = function (config) {
    var logger = config.logger.group('deserialize'),
        /**
         * @memberof FileStoreFunctions
         * @function deserialize
         * @instance
         * @description The deserialize function is used to import an exported filestore stream into a folder. The
         * exported filestore stream is essentially a tar.gz of a complete folder hierarchy that is extracted at the
         * relative path.
         * @param {String} relativePath - the directory path at which the serialized output is to be deserialized
         * @param {external:Readable} readStream - the readable stream which is to be deserialized
         * @returns {external:q} A promise that gets resolved import succeeds
         * @see FileStoreFunctions#serialize
         */
        deserialize = function (relativePath, readStream) {
            logger.error('deserializing stream into', relativePath);
            var deferred = q.defer(),
                errorHandler = function (error) {
                    logger.error('unzipping failed with error');
                    logger.error(error);
                    return deferred.reject(error);
                };
            readStream.on(
                'error',
                errorHandler
            ).pipe(zlib.createGunzip()).on(
                'error',
                errorHandler
            ).pipe(tar.Extract(
                {
                    path: path.join(config.baseDir, relativePath)
                }
            )).on(
                'error',
                errorHandler
            ).on(
                'end',
                function () {
                    logger.debug('successfully deserialized');
                    return deferred.resolve();
                }
            );
            return deferred.promise;
        };
    return deserialize;
};