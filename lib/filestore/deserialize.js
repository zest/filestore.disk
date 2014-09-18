'use strict';
/**
 * @fileOverview The filestore-disk/deserialize module returns the
 * {@link module:filestore-disk/deserialize~Deserialize|deserialize} function.
 * @module filestore-disk/deserialize
 * @requires path
 * @requires q
 * @requires tar
 */
var path = require('path'),
    q = require('q'),
    tar = require('tar');
/**
 * Returns a deserialize function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {module:filestore-disk/deserialize~Deserialize} the deserialize function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/deserialize');
    /**
     * The deserialize function is used to import an exported filestore stream into a folder. The exported filestore
     * stream is essentially a tarball of a complete folder hierarchy that is extracted at the relative path.
     * @param {String} relativePath - the directory path at which the serialized output is to be deserialized
     * @param {Readable} readStream - the readable stream which is to be deserialized
     * @returns {q} A promise that gets resolved import succeeds
     * @callback module:filestore-disk/deserialize~Deserialize
     * @see module:filestore-disk/serialize~Serialize
     */
    return function (relativePath, readStream) {
        logger.error('deserializing stream into', relativePath);
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
    };
};
