'use strict';
var path = require('path'),
    q = require('q'),
    utils = require('./utils');
module.exports = function (config) {
    var logger = config.logger('filestore.disk');
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