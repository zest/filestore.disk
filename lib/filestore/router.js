'use strict';
/**
 * @fileOverview The filestore-disk/router module returns an express router to expose all filestore functions.
 * @module filestore-disk/router
 * @requires {@link external:express}
 * @requires {@link external:util}
 * @requires {@link external:path}
 * @requires {@link external:mime-types}
 */
var express = require('express');
var util = require('util');
var path = require('path');
var mime = require('mime-types');
/**
 * Returns an express router to expose all filestore functions using the config object
 * @param {module:filestore-disk~Config} config - the config object
 * @returns {FileStoreFunctions#router} the express router
 */
module.exports = function (config) {
    /**
     * @memberof FileStoreFunctions
     * @instance
     * @description This is an express router to expose all filestore functions. This router exposes the below REST apis
     * for handling the filestore
     *
     *  1. `GET` apis are used to fetch files. It can be used with the below parameters
     *
     *     1. `<<relative/path/to/base/folder/>>?find=<<glob pattern>>` to find the files matching a glob pattern in a
     *     folder. Responds with a JSON array of {@link module:filestore-disk/utils~Stats} for each file.
     *
     *     2. `<<relative/path/to/base/folder/>>?pack=true` to export a folder into a `tar.gz` file and download it.
     *
     *     3. `<<relative/path/to/base/folder/or/file>>` to stream a file or get the list of files in a folder. Responds
     *     with the file contents or Responds with a JSON array of {@link module:filestore-disk/utils~Stats} for each
     *     file in case the path corresponds to a folder.
     *
     *  2. `PUT` apis are used to create files and folders
     *
     *     1. `<<relative/path/to/base/folder/>>?unpack=true` to import a tar.gz stream sent through the request body
     *     into the specified folder. Responds with `200 OK` when successful.
     *
     *     2. `<<relative/path/to/base/folder/>>?directory=true` to create a directory at the relative path. Responds
     *     with `200 OK` when successful.
     *
     *     3. `<<relative/path/to/file>>` to create a file with request body as contents. Responds with `200 OK` when
     *     successful.
     *
     *  3. `POST`
     *
     *     1. `<<relative/path/to/base/folder/>>?link=<<new/relative/path>>` to create a symlink for the path at the
     *     new path. Responds with `200 OK` when successful.
     *
     *     2. `<<relative/path/to/base/folder/>>?move=<<new/relative/path>>` to move the contents at the path to the
     *     new path. Responds with `200 OK` when successful.
     *
     *     3. `<<relative/path/to/base/folder/>>?copy=<<new/relative/path>>` to copy the contents at the path to the
     *     new path. Responds with `200 OK` when successful.
     *
     *  4. `DELETE`
     *
     *     1. `<<relative/path/to/base/folder/or/file>>` to delete the folder or file at the path. Responds with
     *     `200 OK` when successful.
     *
     */
    var router = express.Router();
    // GET
    router.get(
        '*',
        function (request, response, next) {
            if (request.query.find) {
                require('./find')(config)(request.path, request.query.find).then(
                    function (data) {
                        response.send(data);
                    },
                    function (err) {
                        next(err);
                    }
                );
            } else if (request.query.pack) {
                require('./pack')(config)(request.path).then(
                    function (stream) {
                        response.set(
                            'Content-Disposition', 'attachment; name=zip; filename=' + path.basename(request.path) +
                                '.tar.gz'
                        );
                        response.set('Content-Type', 'application/x-compressed');
                        stream.pipe(response);
                    },
                    function (err) {
                        next(err);
                    }
                );
            } else {
                require('./read')(config)(request.path).then(
                    function (data) {
                        if (!util.isArray(data)) {
                            response.set(
                                'Content-Type',
                                    mime.contentType(path.basename(request.path)) || 'application/octet-stream'
                            );
                            return data.pipe(response);
                        }
                        return response.send(data);
                    },
                    function (err) {
                        next(err);
                    }
                );
            }
        }
        // PUT
    ).put(
        '*',
        function (request, response, next) {
            (function () {
                if (request.query.unpack) {
                    return require('./unpack')(config)(request.path, request);
                } else if (request.query.directory) {
                    return require('./create')(config)(request.path);
                } else {
                    return require('./create')(config)(request.path, request);
                }
            }()).then(
                function () {
                    response.sendStatus(200);
                },
                function (err) {
                    next(err);
                }
            );
        }
        // POST
    ).post(
        '*',
        function (request, response, next) {
            (function () {
                var duplicate = require('./duplicate')(config);
                if (request.query.link) {
                    return duplicate(request.path, request.query.link, duplicate.link);
                } else if (request.query.move) {
                    return duplicate(request.path, request.query.rename, duplicate.move);
                } else if (request.query.copy) {
                    return duplicate(request.path, request.query.copy, duplicate.copy);
                } else {
                    throw new Error('unknown command');
                }
            }()).then(
                function () {
                    response.sendStatus(200);
                },
                function (err) {
                    next(err);
                }
            );
        }
        // DELETE
    ).delete(
        '*',
        function (request, response, next) {
            require('./remove')(config)(request.path).then(
                function () {
                    response.sendStatus(200);
                },
                function (err) {
                    next(err);
                }
            );
        }
    );
    return router;
};