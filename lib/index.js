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
        var config = merge(
            {
                fileEvent: new (require('events').EventEmitter)(),
                logger: (logger || require('base.logger')('filestore.disk'))
            }, options
        );
        // create a function map and return it
        return {
            create: require('./filestore/create')(config),
            read: require('./filestore/read')(config),
            find: require('./filestore/find')(config),
            duplicate: require('./filestore/duplicate')(config),
            remove: require('./filestore/remove')(config),
            pack: require('./filestore/pack')(config),
            unpack: require('./filestore/unpack')(config),
            watch: require('./filestore/watch')(config),
            unwatch: require('./filestore/unwatch')(config),
            router: require('./filestore/router')(config)
        };
    }
];