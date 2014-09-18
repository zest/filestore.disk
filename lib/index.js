'use strict';
var merge = require('merge');
module.exports = [
    'base.logger?',
    'options',
    function (logger, options) {
        var config = merge({
            fileEvent: new (require('events').EventEmitter)(),
            logger: logger || function () {
                return console;
            }
        }, options);
        return {
            create: require('./filestore/create')(config),
            link: require('./filestore/link')(config),
            read: require('./filestore/read')(config),
            getStream: require('./filestore/get-stream')(config),
            find: require('./filestore/find')(config),
            rename: require('./filestore/rename')(config),
            remove: require('./filestore/remove')(config),
            serialize: require('./filestore/serialize')(config),
            deserialize: require('./filestore/deserialize')(config),
            watch: require('./filestore/watch')(config),
            unwatch: require('./filestore/unwatch')(config)
        };
    }
];
