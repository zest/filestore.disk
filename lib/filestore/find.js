'use strict';
/**
 * @fileOverview The filestore-disk/find module returns the {@link module:filestore-disk/find~Find|find} function.
 * @module filestore-disk/find
 * @requires path
 * @requires q
 * @requires filestore-disk/utils
 */
var path = require('path'),
    q = require('q'),
    utils = require('./utils');
/**
 * Returns a find function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {module:filestore-disk/find~Find} the find function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/find');
    /**
     * This function searches a directory for files that match a glob Pattern and returns an array of file metadata for
     * all such files.
     * @param {String} dirPath - the directory path to search
     * @param {String} globPattern - {@link https://github.com/isaacs/minimatch|glob} pattern to use for searching
     * @returns {q} A promise that gets resolved with an array of {@link module:filestore-disk/utils~Stats|Stats}
     * objects, each representing a matched file.
     * @callback module:filestore-disk/find~Find
     */
    return function (dirPath, globPattern) {
        var fileList = [],
            deferred = q.defer(),
            minimatch = require('minimatch'),
            findPath = path.join(config.baseDir, dirPath),
            finder = require('findit')(findPath);
        logger.log('reading files at', dirPath, 'with pattern', globPattern);
        finder.on('path', function (filePath, stat) {
            var relativepath = path.relative(findPath, filePath);
            logger.log('matching ', relativepath, 'with pattern', globPattern);
            if (minimatch(relativepath, globPattern)) {
                logger.log('\tmatch!');
                fileList.push(utils.normalizeStats(stat, path.join(dirPath, relativepath)));
            }
        });
        finder.on('end', function () {
            deferred.resolve(fileList);
        });
        finder.on('error', function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };
};
