'use strict';
var path = require('path'),
    fstream = require('fstream'),
    tar = require('tar');
module.exports = function (config) {
    var logger = config.logger('filestore.disk');
    return function (relativePath) {
        logger.log('serializing', relativePath);
        return fstream.Reader(
            {
                path: path.join(config.baseDir, relativePath),
                type: 'Directory'
            }
        ).pipe(tar.Pack({ noProprietary: true }));
    };
}