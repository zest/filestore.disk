'use strict';
/**
 * @fileOverview The filestore-disk/unpack module returns the {@link FileStoreFunctions#unpack} function.
 * @module filestore-disk/unpack
 * @requires {@link external:path}
 * @requires {@link external:q}
 * @requires {@link external:tar}
 */
var path = require('path'),
    q = require('q'),
    tar = require('tar'),
    zlib = require('zlib');
/**
 * Returns a unpack function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#unpack} the unpack function
 */
module.exports = function (config) {
    var logger = config.logger.group('unpack'),
        /**
         * @memberof FileStoreFunctions
         * @function unpack
         * @instance
         * @description The unpack function is used to import an exported filestore stream into a folder. The
         * exported filestore stream is essentially a tar.gz of a complete folder hierarchy that is extracted at the
         * relative path.
         * @param {String} relativePath - the directory path at which the packd output is to be unpacked
         * @param {external:Readable} readStream - the readable stream which is to be unpacked
         * @returns {external:q} A promise that gets resolved import succeeds
         * @see FileStoreFunctions#pack
         */
        unpack = function (relativePath, readStream) {
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
                    logger.debug('successfully unpacked');
                    return deferred.resolve();
                }
            );
            return deferred.promise;
        };
    return unpack;
};
