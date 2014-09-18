'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    utils = require('./utils');
module.exports = function (config) {
    var logger = config.logger('filestore.disk/read');
    return function (relativePath, encoding) {
        return utils.getStats(config.baseDir, relativePath).then(function (stats) {
            if (stats.type !== 'D') {
                logger.log('reading file at', relativePath);
                return q.denodeify(fs.readFile)(
                    path.join(config.baseDir, relativePath),
                    {
                        encoding: encoding
                    }
                );
            }
            logger.log('reading directory at', relativePath);
            return q.denodeify(fs.readdir)(
                path.join(config.baseDir, relativePath)
            ).then(
                function (files) {
                    return q.all(
                        files.map(function (oneFile) {
                            return utils.getStats(config.baseDir, path.join(relativePath, oneFile));
                        })
                    );
                }
            );
        });
    };
};
