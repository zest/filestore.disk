[![Dependencies][dependencies-image]][dependencies-link]
[![Dev Dependencies][dev-dependencies-image]][dev-dependencies-link]
[![Peer Dependencies][peer-dependencies-image]][peer-dependencies-link]

[![Quality][quality-image]][quality-link]
[![Build Status][build-status-image]][build-status-link]
[![Coverage Status][coverage-status-image]][coverage-status-link]
[![License][license-image]][license-link]


# zest / filestore.disk

> [![base.logger][zest-base-logger-optional-image]][zest-base-logger-optional-link]
> [![options][zest-option-required-image]][zest-option-required-link]
>
> filestore.disk is a filestore component for zest that manages files on disks drives.


## Component Methods

The filestore component exposes the below methods for file and directory handling. The parameter names are 
self-explainatory. For a complete documentation, refer the jsdocs.

 1. **`create`**`(relativePath, fileData)` &#8594; `Promise`

    The create function creates (or overrides) a file or a directory at the path specified. if the fileData variable is
    passed to the function, a file is created. Otherwise, a directory is created. If the parent path at which the file
    or directory is to be created does not exist, it is also created.
    
    This function returns a Promise that gets resolved when the file or directory is created.

 2. **`duplicate`**`(originalPath, linkPath, action)` &#8594; `Promise`

    This function duplicates the file or folder at oldPath to the newPath. It copies, creates symlinks or moves the 
    file / folder to the new path depending on the parameter passed. If the newPath does not exist, it is created.
    
    Action specifies the nature of duplication. It can take the following values
    
      - `L` if a symlink is to be created at the new path
      - `M` if the contents at the old path are to be moved to new path
      - `C` if the contents at the old path are to be copied to the new path
   
    This function returns a promise that gets resolved when duplication succeeds.

 3. **`read`**`(relativePath)` &#8594; `Promise`

    This function reads a file or a directory at a path.
    
    It returns a Promise that gets resolved with the following:
      - an array of object, each representing one of the child items if the read path is a folder or a symlink to a 
        folder.
      - The actual read stream if the read path is a file or a symlink to a file.

 4. **`find`**`(dirPath, globPattern)` &#8594; `Promise`

    This function searches a directory for files that match a glob Pattern and returns an array of file metadata for
    all such files.
    
    It returns a Promise that gets resolved with an array of objects, each representing a matched file.

 5. **`remove`**`(relativePath)` &#8594; `Promise`

    This function deletes anything at the given relative path (including its children if the path corresponds to a
    directory)
    
    It returns a Promise that gets resolved when delete succeeds.

 6. **`pack`**`(relativePath)` &#8594; `Promise`

    This function packs any folder specified by the relativePath and creates a tar.gz stream from it. This stream
    can be stored or used to copy the folder to another location using unpack
    
    It returns a Promise that gets resolved with the read stream when serialization succeeds.

 7. **`unpack`**`(relativePath, readStream)` &#8594; `Promise`

    The unpack function is used to import an exported filestore stream into a folder. The exported filestore
    stream is essentially a tar.gz of a complete folder hierarchy that is extracted at the relative path.
    
    This function returns a Promise that gets resolved import succeeds.

 8. **`watch`**`(baseDir, globPattern, eventType, callback)`

    This function registers watcher functions that get called everytime any of the watched files change.

 9. **`unwatch`**`()`

    This function removes all file watchers registered by the `watch` function

 10. **`router`**

    This is an express router to expose all filestore functions. This router exposes the below REST apis for handling 
    the filestore
    
     1. `GET` apis are used to fetch files. It can be used with the below parameters
     
          1. `<<relative/path/to/base/folder/>>?find=<<glob pattern>>` to find the files matching a glob pattern in a
             folder. Responds with a JSON array of {@link module:filestore-disk/utils~Stats} for each file.
     
          2. `<<relative/path/to/base/folder/>>?pack=true` to export a folder into a `tar.gz` file and download it.
     
          3. `<<relative/path/to/base/folder/or/file>>` to stream a file or get the list of files in a folder. Responds
              with the file contents or Responds with a JSON array of {@link module:filestore-disk/utils~Stats} for each
              file in case the path corresponds to a folder.
     
     2. `PUT` apis are used to create files and folders
     
          1. `<<relative/path/to/base/folder/>>?unpack=true` to import a tar.gz stream sent through the request body
              into the specified folder. Responds with `200 OK` when successful.
     
          2. `<<relative/path/to/base/folder/>>?directory=true` to create a directory at the relative path. Responds
              with `200 OK` when successful.
     
          3. `<<relative/path/to/file>>` to create a file with request body as contents. Responds with `200 OK` when
              successful.
     
     3. `POST`
     
          1. `<<relative/path/to/base/folder/>>?link=<<new/relative/path>>` to create a symlink for the path at the
              new path. Responds with `200 OK` when successful.
     
          2. `<<relative/path/to/base/folder/>>?move=<<new/relative/path>>` to move the contents at the path to the
              new path. Responds with `200 OK` when successful.
     
          3. `<<relative/path/to/base/folder/>>?copy=<<new/relative/path>>` to copy the contents at the path to the
              new path. Responds with `200 OK` when successful.
     
     4. `DELETE`
     
          1. `<<relative/path/to/base/folder/or/file>>` to delete the folder or file at the path. Responds with
              `200 OK` when successful.


[dependencies-image]: http://img.shields.io/david/zest/filestore.disk.svg?style=flat-square
[dependencies-link]: https://david-dm.org/zest/filestore.disk#info=dependencies&view=list
[dev-dependencies-image]: http://img.shields.io/david/dev/zest/filestore.disk.svg?style=flat-square
[dev-dependencies-link]: https://david-dm.org/zest/filestore.disk#info=devDependencies&view=list
[peer-dependencies-image]: http://img.shields.io/david/peer/zest/filestore.disk.svg?style=flat-square
[peer-dependencies-link]: https://david-dm.org/zest/filestore.disk#info=peerDependencies&view=list
[license-image]: http://img.shields.io/badge/license-UNLICENSE-brightgreen.svg?style=flat-square
[license-link]: http://unlicense.org
[quality-image]: http://img.shields.io/codeclimate/github/zest/filestore.disk.svg?style=flat-square
[quality-link]: https://codeclimate.com/github/zest/filestore.disk
[build-status-image]: http://img.shields.io/travis/zest/filestore.disk.svg?style=flat-square
[build-status-link]: https://travis-ci.org/zest/filestore.disk
[coverage-status-image]: http://img.shields.io/coveralls/zest/filestore.disk.svg?style=flat-square
[coverage-status-link]: https://coveralls.io/r/zest/filestore.disk
[zest-base-logger-optional-image]: http://img.shields.io/badge/base.logger-optional-green.svg?style=flat-round
[zest-base-logger-optional-link]: https://github.com/zest/base.logger/blob/master/README.md
[zest-option-required-image]: http://img.shields.io/badge/options-required-orange.svg?style=flat-round
[zest-option-required-link]: https://github.com/zest/base.resolver/blob/master/README.md#explicit-dependencies