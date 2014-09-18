'use strict';
module.exports = function (config) {
    var logger = config.logger('filestore.disk/unwatch');
    return function () {
        logger.log('removing all watchers');
        config.fileEvent.removeAllListeners('create');
        config.fileEvent.removeAllListeners('remove');
    };
};