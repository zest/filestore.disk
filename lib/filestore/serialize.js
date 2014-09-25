'use strict';
/**
 * @fileOverview The filestore-disk/serialize module returns the {@link FileStoreFunctions#serialize} function.
 * @module filestore-disk/serialize
 * @requires {@link external:path}
 * @requires {@link external:fstream}
 * @requires {@link external:tar}
 */
var path = require('path'),
    fstream = require('fstream'),
    tar = require('tar'),
    zlib = require('zlib');
/**
 * Returns a serialize function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#serialize} the serialize function
 */
module.exports = function (config) {
    var logger = config.logger.group('serialize'),
        /**
         * @memberof FileStoreFunctions
         * @function serialize
         * @instance
         * @description This function serializes any folder specified by the relativePath and creates a tar.gz stream
         * from it. This stream can be stored or used to copy the folder to another location using
         * {@link FileStoreFunctions#deserialize|deserialize}
         * @param {String} relativePath - the path of the directory to serialize
         * @returns {external:q} a promise that gets resolved with the read stream when serialization succeeds.
         * @see FileStoreFunctions#deserialize
         */
        serialize = function (relativePath) {
            logger.debug('serializing', relativePath);
            return fstream.Reader(
                {
                    path: path.join(config.baseDir, relativePath),
                    type: 'Directory'
                }
            ).pipe(tar.Pack(
                {
                    noProprietary: true
                }
            )).pipe(zlib.createGzip(
                {
                    level: 6,
                    memLevel: 6
                }
            ));
        };
    return serialize;
};
