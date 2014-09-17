'use strict';
var merge = require('merge');
module.exports = function (logger, options) {
    return merge({
        fileEvent: new (require('events').EventEmitter)(),
        logger: logger || function () {
            return console;
        }
    }, options);
};