'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    config = require('./config');
module.exports.exists = function (filePath) {
    return q.Promise(function (resolve, reject) {
        fs.exists(path.join(config.baseDir, filePath), function (exists) {
            if (exists) {
                return resolve(exists);
            }
            reject(new Error(filePath + ' does not exist!'));
        });
    });
};
module.exports.notExists = function (filePath) {
    return q.Promise(function (resolve, reject) {
        fs.exists(path.join(config.baseDir, filePath), function (exists) {
            if (!exists) {
                return resolve(exists);
            }
            reject(new Error(filePath + ' exists!'));
        });
    });
};
module.exports.normalizeStats = function (stats, filePath) {
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
module.exports.getStats = function (filePath) {
    return q.denodeify(fs.lstat)(
        path.join(config.baseDir, filePath)
    ).then(function (stats) {
        return module.exports.normalizeStats(stats, filePath);
    });
};
