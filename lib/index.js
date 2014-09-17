'use strict';
module.exports = [
    'base.logger#?',
    'options',
    function (logger, options) {
        return require('./filestore/filestore')(
            require('./filestore/config')(logger, options)
        );
    }
];
