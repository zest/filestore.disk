[![Dependencies][dependencies-image]][dependencies-link]
[![Dev Dependencies][dev-dependencies-image]][dev-dependencies-link]
[![Peer Dependencies][peer-dependencies-image]][peer-dependencies-link]

[![Quality][quality-image]][quality-link]
[![Build Status][build-status-image]][build-status-link]
[![Coverage Status][coverage-status-image]][coverage-status-link]
[![License][license-image]][license-link]


# soul-infra / filestore.disk

> [![base.logger][soul-base-logger-optional-image]][soul-base-logger-optional-link]
> [![options][soul-option-required-image]][soul-option-required-link]
>
> filestore.disk is a filestore component for soul that manages files on disks drives.


## Component Methods

The filestore component exposes the below methods for file and directory handling. The parameter names are 
self-explainatory. For a complete documentation, refer the jsdocs.

 1. **`create`**`(relativePath, fileData)` &#8594; `Promise`

    The create function creates (or overrides) a file or a directory at the path specified. if the fileData variable is
    passed to the function, a file is created. Otherwise, a directory is created. If the parent path at which the file
    or directory is to be created does not exist, it is also created.
    
    This function returns a Promise that gets resolved when the file or directory is created.

 2. **`link`**`(originalPath, linkPath)` &#8594; `Promise`

    This function creates a symbolic link at linkPath pointing to the file or directory at original path.
    
    It returns a Promise that gets resolved when the symbolic link is created.

 3. **`read`**`(relativePath, encoding)` &#8594; `Promise`

    This function reads a file or a directory at a path.
    
    It returns a Promise that gets resolved with the following:
      - an array of object, each representing one of the child items if the read path is a folder or a symlink to a 
        folder.
      - The actual read contents if the read path is a file or a symlink to a file.

 4. **`getStream`**`(relativePath)` &#8594; `ReadStream`

    This function creates and returns a readable stream from a file path.
    
    It returns a readable stream object created from the file.

 5. **`find`**`(dirPath, globPattern)` &#8594; `Promise`

    This function searches a directory for files that match a glob Pattern and returns an array of file metadata for
    all such files.
    
    It returns a Promise that gets resolved with an array of objects, each representing a matched file.

 6. **`rename`**`(oldPath, newPath)` &#8594; `Promise`

    This function moves (aka renames) the file or folder at oldPath to the newPath. If the newPath does not exist, it
    is created.
    
    It returns a Promise that gets resolved when the move succeeds.

 7. **`remove`**`(relativePath)` &#8594; `Promise`

    This function deletes anything at the given relative path (including its children if the path corresponds to a
    directory)
    
    It returns a Promise that gets resolved when delete succeeds.

 8. **`serialize`**`(relativePath)` &#8594; `Promise`

    This function serializes any folder specified by the relativePath and creates a tar.gz stream from it. This stream
    can be stored or used to copy the folder to another location using deserialize
    
    It returns a Promise that gets resolved with the read stream when serialization succeeds.

 9. **`deserialize`**`(relativePath, readStream)` &#8594; `Promise`

    The deserialize function is used to import an exported filestore stream into a folder. The exported filestore
    stream is essentially a tar.gz of a complete folder hierarchy that is extracted at the relative path.
    
    This function returns a Promise that gets resolved import succeeds.

 10. **`watch`**`(baseDir, globPattern, eventType, callback)`

    This function registers watcher functions that get called everytime any of the watched files change.

 11. **`unwatch`**`()`

    This function removes all file watchers registered by the `watch` function


[dependencies-image]: http://img.shields.io/david/soul-infra/filestore.disk.svg?style=flat-square
[dependencies-link]: https://david-dm.org/soul-infra/filestore.disk#info=dependencies&view=list
[dev-dependencies-image]: http://img.shields.io/david/dev/soul-infra/filestore.disk.svg?style=flat-square
[dev-dependencies-link]: https://david-dm.org/soul-infra/filestore.disk#info=devDependencies&view=list
[peer-dependencies-image]: http://img.shields.io/david/peer/soul-infra/filestore.disk.svg?style=flat-square
[peer-dependencies-link]: https://david-dm.org/soul-infra/filestore.disk#info=peerDependencies&view=list
[license-image]: http://img.shields.io/badge/license-UNLICENSE-brightgreen.svg?style=flat-square
[license-link]: http://unlicense.org
[quality-image]: http://img.shields.io/codeclimate/github/soul-infra/filestore.disk.svg?style=flat-square
[quality-link]: https://codeclimate.com/github/soul-infra/filestore.disk
[build-status-image]: http://img.shields.io/travis/soul-infra/filestore.disk.svg?style=flat-square
[build-status-link]: https://travis-ci.org/soul-infra/filestore.disk
[coverage-status-image]: http://img.shields.io/coveralls/soul-infra/filestore.disk.svg?style=flat-square
[coverage-status-link]: https://coveralls.io/r/soul-infra/filestore.disk
[soul-base-logger-optional-image]: http://img.shields.io/badge/base.logger-optional-green.svg?style=flat-round
[soul-base-logger-optional-link]: https://github.com/soul-infra/base.logger/blob/master/README.md
[soul-option-required-image]: http://img.shields.io/badge/options-required-orange.svg?style=flat-round
[soul-option-required-link]: https://github.com/soul-infra/base.resolver/blob/master/README.md#explicit-dependencies