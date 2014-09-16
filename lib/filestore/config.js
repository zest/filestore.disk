'use strict';
var merge = require('merge');

module.exports.fileEvent = new (require('events').EventEmitter)();
module.exports.logger = function () {
    return console;
};
module.exports.setOptions = function (options) {
    merge(module.exports, options);
};
module.exports.setLogger = function (logger) {
    if (!logger) {
        return;
    }
    module.exports.logger = logger;
};
