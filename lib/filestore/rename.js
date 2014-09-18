'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    utils = require('./utils');
module.exports = function (config) {
    var logger = config.logger('filestore.disk');
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
