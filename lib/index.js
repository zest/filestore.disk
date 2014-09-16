'use strict';
var config = require('./filestore/config');
module.exports = [
    'base.logger#?',
    'options',
    function(logger, options) {
        config.setOptions(options);
        config.setLogger(logger);
        return require('./filestore/filestore');
    }
];
