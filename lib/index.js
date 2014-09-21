'use strict';
/**
 * @fileOverview filestore.disk is a filestore component for zest that manages files on disks drives.
 * @module filestore-disk
 * @requires {@link external:merge}
 */
var merge = require('merge');
/**
 * @function
 * @param {external:base-logger} [logger] - Optional logger module that can be injected if required. If logger is not
 * specified, it will default to console.
 * @param {module:filestore-disk~Options} options - the options object for configuring the filestore.
 * @returns {FileStoreFunctions} - A map of functions which can be used to access and update the filestore
 */
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
        // create a function map and return it
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