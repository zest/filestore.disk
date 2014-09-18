'use strict';
/**
 * @fileOverview The filestore-disk/serialize module returns the
 * {@link module:filestore-disk/serialize~Serialize|serialize} function.
 * @module filestore-disk/serialize
 * @requires path
 * @requires fstream
 * @requires tar
 */
var path = require('path'),
    fstream = require('fstream'),
    tar = require('tar');
/**
 * Returns a serialize function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {module:filestore-disk/serialize~Serialize} the serialize function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/serialize');
    /**
     * This function serializes any folder specified by the relativePath and creates a tarball stream from it. This
     * stream can be stored or used to copy the folder to another location using
     * {@link module:filestore-disk/deserialize~Deserialize|deserialize}
     * @param {String} relativePath - the path of the directory to serialize
     * @returns {q} a promise that gets resolved with the read stream when serialization succeeds.
     * @callback module:filestore-disk/serialize~Serialize
     * @see module:filestore-disk/deserialize~Deserialize
     */
    return function (relativePath) {
        logger.log('serializing', relativePath);
        return fstream.Reader(
            {
                path: path.join(config.baseDir, relativePath),
                type: 'Directory'
            }
        ).pipe(tar.Pack({ noProprietary: true }));
    };
};
