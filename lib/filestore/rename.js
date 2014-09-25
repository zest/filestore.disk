'use strict';
/**
 * @fileOverview The filestore-disk/rename module returns the {@link FileStoreFunctions#rename} function.
 * @module filestore-disk/rename
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
 * Returns a rename function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#rename} the rename function
 */
module.exports = function (config) {
    var logger = config.logger.group('rename'),
        /**
         * @memberof FileStoreFunctions
         * @function rename
         * @instance
         * @description This function moves (aka renames) the file or folder at oldPath to the newPath. If the newPath
         * does not exist, it is created.
         * @param {String} oldPath - the actual path of the file or directory to move
         * @param {String} newPath - the new path where the file or directory is to be moved
         * @returns {external:q} a promise that gets resolved when move succeeds.
         */
        rename = function (oldPath, newPath) {
            logger.debug('renaming', oldPath, 'to', newPath);
            return require('./create')(config)(
                path.dirname(newPath)
            ).then(
                function () {
                    return q.denodeify(fs.rename)(
                        path.join(config.baseDir, oldPath),
                        path.join(config.baseDir, newPath)
                    );
                }
            ).then(
                function () {
                    return utils.getStats(config.baseDir, newPath).then(function (stats) {
                        return process.nextTick(function () {
                            if (stats.type !== 'F') {
                                return;
                            }
                            logger.debug('emitting remove for', oldPath);
                            config.fileEvent.emit('remove', oldPath);
                            logger.debug('emitting create for', newPath);
                            config.fileEvent.emit('create', newPath);
                        });
                    });
                }
            );
        };
    return rename;
};
