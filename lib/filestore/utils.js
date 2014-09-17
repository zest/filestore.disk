'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q');
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
module.exports.getStats = function (baseDir, filePath) {
    return q.denodeify(fs.stat)(
        path.join(baseDir, filePath)
    ).then(
        function (stats) {
            return module.exports.normalizeStats(stats, filePath);
        }
    );
};
