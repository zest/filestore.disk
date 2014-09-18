'use strict';
/**
 * @fileOverview The filestore-disk/unwatch module returns the {@link module:filestore-disk/unwatch~Unwatch|unwatch}
 * function.
 * @module filestore-disk/unwatch
 */
/**
 * Returns an unwatch function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {module:filestore-disk/unwatch~Unwatch} the unwatch function
 */
module.exports = function (config) {
    var logger = config.logger('filestore.disk/unwatch');
    /**
     * This function removes all file watchers registered by the {@link module:filestore-disk/watch~Watch|watch}
     * function
     * @callback module:filestore-disk/unwatch~Unwatch
     * @see module:filestore-disk/watch~Watch
     */
    return function () {
        logger.log('removing all watchers');
        config.fileEvent.removeAllListeners('create');
        config.fileEvent.removeAllListeners('remove');
    };
};
