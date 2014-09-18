'use strict';
module.exports = function (config) {
    return function () {
        config.fileEvent.removeAllListeners('create');
        config.fileEvent.removeAllListeners('remove');
    };
};