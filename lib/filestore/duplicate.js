'use strict';
/**
 * @fileOverview The filestore-disk/duplicate module returns the {@link FileStoreFunctions#duplicate} function.
 * @module filestore-disk/duplicate
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
 * Returns a duplicate function using the config object. The duplicate function, renames, creates symlinks and copies
 * files or folders
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#duplicate} the duplicate function
 */
module.exports = function (config) {
    var logger = config.logger.group('rename');
    /**
     * @memberof FileStoreFunctions
     * @function link
     * @inner
     * @description This function creates a symbolic link at linkPath pointing to the file or directory at original
     * path
     * @param {String} originalPath - the actual path to link
     * @param {String} linkPath - the location where the new link should be created
     * @returns {external:q} a promise that gets resolved when the symbolic link is created
     */
    var link = function (originalPath, linkPath) {
        logger.debug('linking', linkPath, 'to path', originalPath);
        return utils.getStats(config.baseDir, originalPath).then(
            function (stats) {
                return require('./create')(config)(
                    path.dirname(linkPath)
                ).then(
                    function () {
                        return stats;
                    }
                );
            }
        ).then(
            function (stats) {
                return q.denodeify(fs.symlink)(
                    path.join(config.baseDir, originalPath),
                    path.join(config.baseDir, linkPath),
                    (stats.type === 'D' ? 'dir' : 'file')
                );
            }
        );
    };
    /**
     * @memberof FileStoreFunctions
     * @function move
     * @inner
     * @description This function moves (aka renames) the file or folder at oldPath to the newPath. If the newPath
     * does not exist, it is created.
     * @param {String} oldPath - the actual path of the file or directory to move
     * @param {String} newPath - the new path where the file or directory is to be moved
     * @returns {external:q} a promise that gets resolved when move succeeds.
     */
    var move = function (oldPath, newPath) {
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
                return utils.getStats(config.baseDir, newPath).then(
                    function (stats) {
                        return process.nextTick(
                            function () {
                                if (stats.type !== 'F') {
                                    return;
                                }
                                logger.debug('emitting remove for', oldPath);
                                config.fileEvent.emit('remove', oldPath);
                                logger.debug('emitting create for', newPath);
                                config.fileEvent.emit('create', newPath);
                            }
                        );
                    }
                );
            }
        );
    };
    /**
     * @memberof FileStoreFunctions
     * @function copy
     * @inner
     * @description This function copies the file or folder at oldPath to the newPath. If the newPath does not exist,
     * it is created.
     * @param {String} oldPath - the actual path of the file or directory to copy
     * @param {String} newPath - the new path where the file or directory is to be copied
     * @returns {external:q} a promise that gets resolved when copy succeeds.
     */
    var copy = function (oldPath, newPath) {
        logger.debug('copying', oldPath, 'to', newPath);
        return require('./create')(config)(
            path.dirname(newPath)
        ).then(
            function () {
                return q.denodeify(fs.copy)(
                    path.join(config.baseDir, oldPath),
                    path.join(config.baseDir, newPath)
                );
            }
        ).then(
            function () {
                return utils.getStats(config.baseDir, newPath).then(
                    function (stats) {
                        return process.nextTick(
                            function () {
                                if (stats.type !== 'F') {
                                    return;
                                }
                                logger.debug('emitting create for', newPath);
                                config.fileEvent.emit('create', newPath);
                            }
                        );
                    }
                );
            }
        );
    };
    /**
     * @memberof FileStoreFunctions
     * @function duplicate
     * @instance
     * @description This function duplicates the file or folder at oldPath to the newPath. It copies, creates symlinks
     * or moves the file / folder to the new path depending on the parameter passed. If the newPath does not exist,
     * it is created.
     * @param {String} oldPath - the actual path of the file or directory to duplicate
     * @param {String} newPath - the new path where the file or directory is to be duplicated
     * @param {String} action - action specifies the nature of duplication. It can take the following values
     *
     *   - `L` if a symlink is to be created at the new path
     *   - `M` if the contents at the old path are to be moved to new path
     *   - `C` if the contents at the old path are to be copied to the new path
     *
     * @returns {external:q} a promise that gets resolved when duplication succeeds.
     * @see FileStoreFunctions~link
     * @see FileStoreFunctions~move
     * @see FileStoreFunctions~copy
     */
    var duplicate = function (oldPath, newPath, action) {
        if (action === duplicate.link) {
            return link(oldPath, newPath);
        } else if (action === duplicate.move) {
            return move(oldPath, newPath);
        } else if (action === duplicate.copy) {
            return copy(oldPath, newPath);
        }
    };
    duplicate.link = 'L';
    duplicate.move = 'M';
    duplicate.copy = 'C';
    return duplicate;
};
