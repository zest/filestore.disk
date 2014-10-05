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
 * @property {external:base-logger|console} logger - The logger to be used by this component.
 * @property {EventEmitter} fileEvent - An event emitter object which is used to emit and listen to file change events.
 * @property {string} baseDir - The absolute path where the files have to be stored.
 */
// documenting the FileStoreFunctions namespace that contains all filestore functions
/**
 * The filestore object is returned when filestore gets resolved. This Object has static functions to access
 * the store.
 * @namespace FileStoreFunctions
 */
// documenting the Stats object
/**
 * The Stats object is a normalized file metadata that is used by filestore
 * @typedef {object} module:filestore-disk/utils~Stats
 * @property {String} name - The base name (including extension) of the file
 * @property {string} extension - The file extension
 * @property {string} path - filestore-relative path of the file
 * @property {String} type - the type of the file, can be F (for file), D (for directories) or L (for links)
 * @property {Number} size - the size of the file
 * @property {Date} created - when was the file created
 * @property {Date} modified - when was the file last modified
 */
// external node classes
/**
 * The node Buffer class
 * @external Buffer
 * @see {@link http://nodejs.org/api/buffer.html}
 */
/**
 * This module contains utilities for handling and transforming file paths.
 * @external path
 * @see {@link http://nodejs.org/api/path.html}
 */
/**
 * A stream is an abstract interface implemented by various objects in Node
 * @external stream
 * @see {@link http://nodejs.org/api/stream.html}
 */
/**
 * The node stream.Readable class
 * @external Readable
 * @see {@link http://nodejs.org/api/stream.html#stream_class_stream_readable}
 */
// external zest modules
/**
 * base.logger is a basic logger module used throughout zest-infra to log onto the node console or files. It takes a
 * module name as reference and returns a logger object with log, info, warn and error methods.
 * @external base-logger
 * @see {@link https://github.com/zest/base.logger/blob/master/README.md}
 */
// external node modules
/**
 * q is a promise library for node.
 * @external q
 * @see {@link https://www.npmjs.org/package/q}
 */
/**
 * fs-extra contains methods that aren't included in the vanilla Node.js fs package. Such as mkdir -p, cp -r, and rm -rf
 * @external fs-extra
 * @see {@link https://www.npmjs.org/package/fs-extra}
 */
/**
 * Merge multiple objects into one, optionally creating a new cloned object. Similar to the jQuery.extend but more
 * flexible. Works in Node.js and the browser
 * @external merge
 * @see {@link https://www.npmjs.org/package/merge}
 */
/**
 * walk a directory tree recursively with events
 * @external findit
 * @see {@link https://www.npmjs.org/package/findit}
 */
/**
 * a glob matcher in javascript
 * @external minimatch
 * @see {@link https://www.npmjs.org/package/minimatch}
 */
/**
 * tar for node
 * @external tar
 * @see {@link https://www.npmjs.org/package/tar}
 */
/**
 * Advanced file system stream things
 * @external fstream
 * @see {@link https://www.npmjs.org/package/fstream}
 */
/**
 * Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web
 * and mobile applications.
 * @external express
 * @see {@link http://www.expressjs.com}
 */
/**
 * The ultimate javascript content-type utility.
 * @external mime-types
 * @see {@link https://www.npmjs.org/package/mime-types}
 */
/**
 * Nodejs utility module.
 * @external util
 * @see {@link http://nodejs.org/api/util.html}
 */