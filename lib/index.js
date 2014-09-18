'use strict';
/**
 * @fileOverview filestore.disk is a filestore component for soul that manages files on disks drives.
 * @module filestore-disk
 * @requires merge
 */
var merge = require('merge');
/**
 * @function
 * @param {module:base-logger} [logger] - Optional logger module that can be injected if required. If logger is not
 * specified, it will default to console.
 * @param {module:filestore-disk~Options} options - the options object for configuring the filestore.
 * @returns {module:filestore-disk~FileStore} - A map of functions which can be used to access and update the filestore
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
        /**
         * The filestore object is returned when filestore gets resolved. This Object has static functions to access
         * the store.
         * @typedef {object} module:filestore-disk~FileStore
         * @property {module:filestore-disk/create~Create} create - the create function
         * @property {module:filestore-disk/link~Link} link - the link function
         * @property {module:filestore-disk/read~Read} read - the read function
         * @property {module:filestore-disk/get-stream~GetStream} getStream - the getStream function
         * @property {module:filestore-disk/find~Find} find - the find function
         * @property {module:filestore-disk/rename~Rename} rename - the rename function
         * @property {module:filestore-disk/remove~Remove} remove - the remove function
         * @property {module:filestore-disk/serialize~Serialize} serialize - the serialize function
         * @property {module:filestore-disk/deserialize~Deserialize} deserialize - the deserialize function
         * @property {module:filestore-disk/watch~Watch} watch - the watch function
         * @property {module:filestore-disk/unwatch~Unwatch} unwatch - the unwatch function
         */
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
// documenting the options object used by the component
/**
 * The options object is used to configure the filestore
 * @typedef {object} module:filestore-disk~Options
 * @property {string} baseDir - The absolute path where the files have to be stored.
 */
// documenting the config object used inside the component
/**
 * The options object is used to configure the filestore
 * @typedef {object} module:filestore-disk~Config
 * @property {module:base-logger|console} logger - The logger to be used by this component.
 * @property {EventEmitter} fileEvent - An event emitter object which is used to emit and listen to file change events.
 * @property {string} baseDir - The absolute path where the files have to be stored.
 */
// documenting the namespace for use
/**
 * The filestore object is returned when filestore gets resolved. This Object has static functions to access
 * the store.
 * @namespace FileStoreFunctions
 * @borrows module:filestore-disk/create~Create as create
 * @borrows module:filestore-disk/link~Link as link
 * @borrows module:filestore-disk/read~Read as read
 * @borrows module:filestore-disk/get-stream~GetStream as getStream
 * @borrows module:filestore-disk/find~Find as find
 * @borrows module:filestore-disk/rename~Rename as rename
 * @borrows module:filestore-disk/remove~Remove as remove
 * @borrows module:filestore-disk/serialize~Serialize as serialize
 * @borrows module:filestore-disk/deserialize~Deserialize as deserialize
 * @borrows module:filestore-disk/watch~Watch as watch
 * @borrows module:filestore-disk/unwatch~Unwatch as unwatch
 */
