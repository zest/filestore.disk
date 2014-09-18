'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q');
module.exports = function (config) {
    var logger = config.logger('filestore.disk');
    return function (relativePath) {
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
}