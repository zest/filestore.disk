'use strict';
var fs = require('fs-extra'),
    path = require('path'),
    q = require('q');
module.exports = function (config) {
    return function () {
        config.fileEvent.removeAllListeners('create');
        config.fileEvent.removeAllListeners('remove');
    };
}