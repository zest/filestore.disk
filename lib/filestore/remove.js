'use strict';
/**
 * @fileOverview The filestore-disk/remove module returns the {@link FileStoreFunctions#remove} function.
 * @module filestore-disk/remove
 * @requires {@link external:fs-extra}
 * @requires {@link external:path}
 * @requires {@link external:q}
 */
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q');
/**
 * Returns a remove function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#remove} the remove function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/remove'),
        /**
         * @memberof FileStoreFunctions
         * @function remove
         * @instance
         * @description This function deletes anything at the given relative path (including its children if the path
         * corresponds to a directory)
         * @param {String} relativePath - the actual path of the file or directory to delete
         * @returns {external:q} a promise that gets resolved when delete succeeds.
         */
        remove = function (relativePath) {
            logger.log('deleting', relativePath);
            return q.denodeify(fs.remove)(
                path.join(config.baseDir, relativePath)
            ).then(
                function () {
                    return process.nextTick(function () {
                        config.fileEvent.emit('remove', relativePath);
                    });
                }
            );
        };
    return remove;
};
