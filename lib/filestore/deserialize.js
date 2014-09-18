'use strict';
var path = require('path'),
    q = require('q'),
    tar = require('tar');
module.exports = function (config) {
    var logger = config.logger('filestore.disk/deserialize');
    return function (relativePath, readStream) {
        var deferred = q.defer();
        readStream.pipe(tar.Extract(
            {
                path: path.join(config.baseDir, relativePath)
            }
        )).on(
            'error',
            function (error) {
                logger.error('unzipping failed with error');
                logger.error(error);
                return deferred.reject(error);
            }
        ).on(
            'end',
            function () {
                logger.log('successfully deserialized');
                return deferred.resolve();
            }
        );
        return deferred.promise;
    };
};
