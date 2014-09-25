'use strict';
/**
 * @fileOverview The filestore-disk/watch module returns the {@link FileStoreFunctions#watch} function.
 * @module filestore-disk/watch
 * @requires {@link external:path}
 */
var path = require('path');
/**
 * Returns an watch function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#watch} the watch function
 */
module.exports = function (config) {
    var logger = config.logger.group('watch'),
        /**
         * @memberof FileStoreFunctions
         * @function
         * @instance
         * @name watch
         * @description This function registers watcher functions that get called everytime any of the watched files
         * change
         * @param {String} baseDir - The basedir to watch for file additions and deletions
         * @param {String} [globPattern] - the glob pattern is used to filter watched files list in baseDir. If not
         * specified, all files inside baseDir are watched.
         * @param {String} [eventType] - eventType, if specified, can be **`create`** or **`remove`** which will
         * restrict watching only file creations or deletions respectively. If not specified, both creation and deletion
         * will be watched.
         * @param {module:filestore-disk/watch~Callback} callback - the callback function to be called when a watched
         * file is changed, created or removed
         * @see FileStoreFunctions#unwatch
         */
        watch = function (baseDir, globPattern, eventType, callback) {
            var minimatch = require('minimatch');
            // normalizing params
            if (!callback && !eventType) {
                // 2 params
                callback = globPattern;
                eventType = 'create,remove';
                globPattern = '**/*';
            } else if (!callback) {
                // 3 params
                callback = eventType;
                eventType = 'create,remove';
                if (globPattern === 'create' || globPattern === 'remove') {
                    eventType = globPattern;
                    globPattern = '**/*';
                }
            }
            eventType.split(',').forEach(function (thisEvent) {
                config.fileEvent.on(thisEvent, function (filePath) {
                    logger.debug(thisEvent, 'captured on', filePath);
                    logger.debug('matching with pattern', globPattern);
                    if (minimatch(path.relative(baseDir, filePath), globPattern)) {
                        callback(filePath, thisEvent);
                    }
                });
            });
        };
    return watch;
};
// defining the watch callback
/**
 * The Watch function is sent as the last argument to the {@link module:filestore-disk/watch~Watch|watch} function.
 * @param {String} filePath - the path of the file that caused the watcher to be invoked. This is the file that has
 * been changed, created or removed
 * @param {String} event - the event that triggered the watcher function. Can be **`create`** or **`remove`**.
 * @callback module:filestore-disk/watch~Callback
 */
