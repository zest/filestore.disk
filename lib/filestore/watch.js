'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q'),
    utils = require('./utils');
module.exports = function (config) {
    var logger = config.logger('filestore.disk');
    return function (baseDir, globPattern, eventType, callback) {
        var minimatch = require('minimatch');
        // normalizing params
        if (!callback && !eventType) {
            // 2 params
            callback = globPattern;
            eventType = 'create,remove';
            globPattern = '**/*';
        } else if (!callback) {
            // 3 params
            callback = eventType;
            eventType = 'create,remove';
            if (globPattern === 'create' || globPattern === 'remove') {
                eventType = globPattern;
                globPattern = '**/*';
            }
        }
        eventType.split(',').forEach(function (thisEvent) {
            config.fileEvent.on(thisEvent, function (filePath) {
                logger.log(thisEvent, 'captured on', filePath);
                logger.log('matching with pattern', globPattern);
                if (minimatch(path.relative(baseDir, filePath), globPattern)) {
                    callback(filePath, thisEvent);
                }
            });
        });
    };
}