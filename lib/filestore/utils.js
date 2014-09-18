'use strict';
/**
 * @fileOverview The filestore-disk/utils module returns a map of utility functions used throughout the filestore.
 * @module filestore-disk/utils
 * @requires fs-extra
 * @requires path
 * @requires q
 */
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q');
/**
 * This function takes node file stats and normalizes it for use by the filestore
 * @param {fs.Stats} stats - the node file stats object
 * @param {String} filePath - the path of the file whose stat is to be normalized
 * @returns {module:filestore-disk/utils~Stats} the stats object
 */
exports.normalizeStats = function (stats, filePath) {
    var type;
    if (stats.isFile()) {
        type = 'F';
    } else if (stats.isDirectory()) {
        type = 'D';
    } else if (stats.isSymbolicLink()) {
        type = 'L';
    }
    return {
        name: path.basename(filePath),
        extension: path.extname(filePath),
        path: filePath,
        type: type,
        size: stats.size,
        created: stats.ctime,
        modified: stats.mtime
    };
};
/**
 * This function gets the file stats from the path specified, normalizes it using the
 * {@link module:filestore-disk/utils.normalizeStats|normalizeStats} function and returns it.
 * @param {String} baseDir - the root directory for the filestore
 * @param {String} filePath - the path of the file or directory whose stat is to be fetched
 * @returns {q} A promise that gets resolved by the {@link module:filestore-disk/utils~Stats|Stats} object once the
 * stats are fetched and normalized. In case of an error, the promise is rejected with the error.
 */
exports.getStats = function (baseDir, filePath) {
    return q.denodeify(fs.stat)(
        path.join(baseDir, filePath)
    ).then(
        function (stats) {
            return exports.normalizeStats(stats, filePath);
        }
    );
};
// documenting the Stats object
/**
 * The Stats object is a normalized file metadata that is used by filestore
 * @typedef {object} module:filestore-disk/utils~Stats
 * @property {String} name - The base name (including extension) of the file
 * @property {string} extension - The file extension
 * @property {string} path - filestore-relative path of the file
 * @property {String} type - the type of the file, can be F (for file), D (for directories) or L (for links)
 * @property {Number} size - the size of the file
 * @property {Date} created - when was the file created
 * @property {Date} modified - when was the file last modified
 */
