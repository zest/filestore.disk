'use strict';
/**
 * @fileOverview The filestore-disk/link module returns the {@link FileStoreFunctions#link} function.
 * @module filestore-disk/link
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
 * Returns a link function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#link} the link function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/link'),
        /**
         * @memberof FileStoreFunctions
         * @function link
         * @instance
         * @description This function creates a symbolic link at linkPath pointing to the file or directory at original
         * path
         * @param {String} originalPath - the actual path to link
         * @param {String} linkPath - the location where the new link should be created
         * @returns {external:q} a promise that gets resolved when the symbolic link is created
         */
        link = function (originalPath, linkPath) {
            logger.log('linking', linkPath, 'to path', originalPath);
            return utils.getStats(config.baseDir, originalPath).then(function (stats) {
                return require('./create')(config)(
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
        };
    return link;
};
