'use strict';
/**
 * @fileOverview The filestore-disk/rename module returns the {@link module:filestore-disk/rename~Rename|rename}
 * function.
 * @module filestore-disk/rename
 * @requires fs-extra
 * @requires path
 * @requires q
 * @requires filestore-disk/utils
 */
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    utils = require('./utils');
/**
 * Returns a rename function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {module:filestore-disk/rename~Rename} the rename function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/rename');
    /**
     * This function moves (aka renames) the file or folder at oldPath to the newPath. If the newPath does not exist,
     * it is created.
     * @param {String} oldPath - the actual path of the file or directory to move
     * @param {String} oldPath - the new path where the file or directory is to be moved
     * @returns {q} a promise that gets resolved when move succeeds.
     * @callback module:filestore-disk/rename~Rename
     */
    return function (oldPath, newPath) {
        logger.log('renaming', oldPath, 'to', newPath);
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
                        logger.log('emitting remove for', oldPath);
                        config.fileEvent.emit('remove', oldPath);
                        logger.log('emitting create for', newPath);
                        config.fileEvent.emit('create', newPath);
                    });
                });
            }
        );
    };
};
