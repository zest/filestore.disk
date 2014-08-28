'use strict';
var specifications = require('base.specifications'),
    logger = require('base.logger')('components/filestore/disk');
module.exports = specifications.components.FileStoreProvider.extend(
    /**
     * @lends components/filestore-disk.prototype
     */
    {
        /**
         * @classDesc filestore-disk
         * @exports components/filestore-disk
         * @extends components/FileStoreProvider
         * @constructor
         * @abstract
         */
        init: function (settings, resolver) {
            logger.info('initializing...');
            return;
        },
        serialize: specifications.base.Class.abstract,
        deserialize: specifications.base.Class.abstract
    }
);
