'use strict';
/**
 * @fileOverview The filestore-disk/unwatch module returns the {@link FileStoreFunctions#unwatch} function.
 * @module filestore-disk/unwatch
 */
/**
 * Returns an unwatch function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#unwatch} the unwatch function
 */
module.exports = function (config) {
    var logger = config.logger.group('unwatch'),
        /**
         * @memberof FileStoreFunctions
         * @function
         * @instance
         * @name unwatch
         * @description This function removes all file watchers registered by the {@link FileStoreFunctions#watch}
         * function
         * @see FileStoreFunctions#watch
         */
        unwatch = function () {
            logger.debug('removing all watchers');
            config.fileEvent.removeAllListeners('create');
            config.fileEvent.removeAllListeners('remove');
        };
    return unwatch;
};
