'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    utils = require('./utils');
module.exports = function (config) {
    var logger = config.logger('filestore.disk');
    return function (originalPath, linkPath) {
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
}