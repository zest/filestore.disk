'use strict';
/**
 * @fileOverview The filestore-disk/pack module returns the {@link FileStoreFunctions#pack} function.
 * @module filestore-disk/pack
 * @requires {@link external:path}
 * @requires {@link external:fstream}
 * @requires {@link external:tar}
 */
var path = require('path'),
    fstream = require('fstream'),
    fs = require('fs-extra'),
    tar = require('tar'),
    zlib = require('zlib'),
    q = require('q');
/**
 * Returns a pack function using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#pack} the pack function
 */
module.exports = function (config) {
    var logger = config.logger.group('pack'),
        /**
         * @memberof FileStoreFunctions
         * @function pack
         * @instance
         * @description This function packs any folder specified by the relativePath and creates a tar.gz stream
         * from it. This stream can be stored or used to copy the folder to another location using
         * {@link FileStoreFunctions#unpack|unpack}
         * @param {String} relativePath - the path of the directory to pack
         * @returns {external:q} a promise that gets resolved with the read stream when serialization succeeds.
         * @see FileStoreFunctions#unpack
         */
        pack = function (relativePath) {
            logger.debug('serializing', relativePath);
            return q.denodeify(fs.stat)(path.join(config.baseDir, relativePath)).then(
                function () {
                    return fstream.Reader(
                        {
                            path: path.join(config.baseDir, relativePath),
                            type: 'Directory'
                        }
                    ).pipe(
                        tar.Pack(
                            {
                                noProprietary: true
                            }
                        )
                    ).pipe(
                        zlib.createGzip(
                            {
                                level: 6,
                                memLevel: 6
                            }
                        )
                    );
                }
            );
        };
    return pack;
};
