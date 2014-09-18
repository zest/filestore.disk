'use strict';
/**
 * @fileOverview The filestore-disk/get-stream module returns the {@link FileStoreFunctions#getStream} function.
 * @module filestore-disk/get-stream
 * @requires {@link external:fs-extra}
 * @requires {@link external:path}
 */
var fs = require('fs-extra'),
    path = require('path');
/**
 * Returns a getStream function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#getStream} the getStream function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/get-stream'),
        /**
         * @memberof FileStoreFunctions
         * @function getStream
         * @instance
         * @description This function creates and returns a readable stream from a file path.
         * @param {String} relativePath - the file path to stream
         * @returns {ReadStream} a readable stream object created from the file
         */
        getStream = function (relativePath) {
            logger.log('creating read stream', relativePath);
            return fs.createReadStream(path.join(config.baseDir, relativePath));
        };
    return getStream;
};
