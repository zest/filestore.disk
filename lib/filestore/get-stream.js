'use strict';
var fs = require('fs-extra'),
    path = require('path');
module.exports = function (config) {
    var logger = config.logger('filestore.disk');
    return function (relativePath) {
        logger.log('creating read stream', relativePath);
        return fs.createReadStream(path.join(config.baseDir, relativePath));
    };
};