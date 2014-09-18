'use strict';
/**
 * @fileOverview The filestore-disk/read module returns the {@link FileStoreFunctions#read} function.
 * @module filestore-disk/read
 * @requires {@link external:fs-extra}
 * @requires {@link external:path}
 * @requires {@link external:q}
 * @requires filestore-disk/utils
 */
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    utils = require('./utils');
/**
 * Returns a read function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#read} the read function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/read'),
        /**
         * @memberof FileStoreFunctions
         * @function read
         * @instance
         * @description This function reads a file or a directory at a path.
         * @param {String} relativePath - the actual path of the file or directory to read
         * @param {String} [encoding] - the encoding to use. This parameter is ignored if the path to be read is a
         * directory or a link
         * @returns {external:q} a promise that gets resolved with the following:
         *  <ul><li>an array of {@link module:filestore-disk/utils~Stats|Stats} object for all child items if the read
         *  path is a folder or a symlink to a folder.</li>
         *  <li>The actual read contents if the read path is a file or a symlink to a file.</li>
         */
        read = function (relativePath, encoding) {
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
        };
    return read;
};
