[![Quality](https://codeclimate.com/github/pranavjha/soul/badges/gpa.svg)](https://codeclimate.com/github/pranavjha/soul)
[![Dependencies](https://david-dm.org/pranavjha/soul.svg)](https://david-dm.org/pranavjha/soul)
[![Build Status](https://secure.travis-ci.org/pranavjha/soul.svg)](https://travis-ci.org/pranavjha/soul)
[![Coverage Status](https://img.shields.io/coveralls/pranavjha/soul.svg)](https://coveralls.io/r/pranavjha/soul)

# [soul](http://pranavjha.github.io/soul)
soul is an integrator module written on node. It integrates components to create an application.

## components

Components are blocks of code that can be combined together to create an application. Any soul application can have 
one or more of the below components

1. Application
    - An application is a runnable component that, when run, starts a node server and deploys itself
2. User
    - User Component manages application users. Users use applications to work on data and files. This component also 
      provides interfaces for authenticating, adding, modifying and deleting users.
3. Privilege
    - The Privilege component checks if a user has enough previlige to perform specific work on data and files. It 
    also provides interfaces for adding, modifying and deleting previliges, as well as for granting and revoking 
    privileges from users.
4. DataStore
    - The DataStore component allows persisting and modifying data for later use in the application.
5. FileStore
    - The FileStore component allows persisting and modifying files for later use in the application.

## component providers

Components can be served by **ComponentProviders**. ComponentProviders can be of two types:

1. **Native providers** that use nodejs
2. **Non-Native providers** that run on non native apis. The non-native providers will have adapters to adapt them to 
    node environment. The adapter for the below providers have to be implemented. Other adapters can be plugged in if 
    required.
    1. **REST Provider** provides adapter for components that run on rest apis

Every component is described by an interface in soul and must implement it.

## stack

* [Node.js](http://nodejs.org/) for modules
* [GruntJS](http://gruntjs.com/) for build automation
* [Jasmine](http://jasmine.github.io/) for testing
* [Istanbul JS](http://gotwarlost.github.io/istanbul/) for code coverage
* [JSDoc](http://usejsdoc.org/) with [Docstrap](https://github.com/terryweiss/docstrap) 
    and [Docco](http://jashkenas.github.io/docco/) for documentation
* [Code Climate](https://codeclimate.com) for code quality
* [David](https://david-dm.org) for node dependency watch
* [Travis CI](https://travis-ci.org) for build automation
* [Coveralls](https://coveralls.io) for code coverage

## installation

### platform & tools

You need to install Node.js and then the development tools. Node.js comes with a package manager called 
[npm](http://npmjs.org) for installing NodeJS applications and libraries.
* [Install node.js](http://nodejs.org/download/) (requires node.js version >= 0.10)
* Install Grunt-CLI and bower as global npm modules:

    npm install -g grunt-cli bower

(Note that you may need to uninstall grunt 0.3 globally before installing grunt-cli)

### getting the code

Either clone this repository or fork it on GitHub and clone your fork:

    git clone https://github.com/pranavjha/soul.git
    cd soul

### local dependencies

To install local dependencies, run the below command (from the project root folder):

    npm install

(This will install the dependencies declared in the package.json file)

## building & running
Once the local dependencies are installed, you can build and run the application using grunt.

To start the application, run the below command (from the project root folder):

    npm init

In development mode, to validate changes on each save run the below command

    npm observe

The both `init` and `observe` commands run tests, However to run tests separately, use

    npm test

The documentation for the integrator can be found in the `docs` folder. To generate documentation from scratch, use

    npm document

## the source

### component interfaces

1. **`interfaces/infrastructure/ComponentProvider`** is the base class for all components and has the below methods
    1. **`describe()`**
        - returns map of settings for the component with their description.
    2. **`init`**`(settings, resolver)`
        - initializes the component
    3. **`export`**`(stream)`
        - exports the component with objects into a stream
    4. **`import`**`(stream)`
        - imports the component from a stream
2. **`interfaces/infrastructure/RunnableProvider`** `extends interfaces/infrastructure/ComponentProvider` is the base class for all 
    runnable components
    1. **`run`**`()`
        - runs the component
3. **`adapters/RestComponentAdapter`** adapts rest components to the native apis
    1. **`adapt`**`(componentName, restSettings)`
        - adapts the REST providers to node native providers
4. **`interfaces/components/ApplicationProvider`** `extends interfaces/infrastructure/RunnableProvider` is an interface describing the 
    specifications for Application Components
    1. **`run`**`()`
        - starts the application using the settings specified
5. **`interfaces/components/UserProvider`** `extends interfaces/infrastructure/ComponentProvider` is an interface describing the 
    specifications for User Components
    1. **`create`**`(user)`
        - persists a user
    2. **`read`**`(token)`
        - returns the user object from the token
    3. **`update`**`(user)`
        - updates the user object
    4. **`remove`**`(user)`
        - removes a user
    5. **`authenticate`**`(user)`
        - authenticates and returns a token
6. **`interfaces/components/PrivilegeProvider`** `extends interfaces/infrastructure/ComponentProvider` is an interface describing the 
    specifications for User Privilege Components
    1. **`create`**`(privilege)`
        - persists a privilege
    2. **`read`**`(name)`
        - returns the privilege
    3. **`update`**`(privilege)`
        - updates the privilegeobject
    4. **`remove`**`(privilege)`
        - removes a privilege
    5. **`allow`**`(privilegeName, user)`
        - adds a privilege to a user
    6. **`deny`**`(privilegeName, user)`
        - removes a privilege from a user
    7. **`isPrivileged`**`(user, privilegeName)`
        - checks if a user has a privilege
7. **`interfaces/components/DataStoreProvider`** `extends interfaces/infrastructure/ComponentProvider` is an interface describing the 
    specifications for Data Store Components
    1. **`create`**`(name, structure)`
        - creates a store and returns a store object
    2. **`read`**`(name)`
        - reads a store by name
    3. **`update`**`(name, structure)`
        - updates a store
    4. **`remove`**`(storeName)`
        - removes a store
    5. **`<store>.create`**`(storeName)`
        - adds a store item to the store
    6. **`<store>.read`**`(storeName, searchQuery)`
        - get an element from the store
    7. **`<store>.update`**`(storeName, item)`
        - updates a store item
    8. **`<store>.remove`**`(storeName, item)`
        - deletes a store item
8. **`interfaces/components/FileStoreProvider`** `extends interfaces/infrastructure/ComponentProvider` is an interface describing the 
    specifications for File Store Components
    1. **`<directory>.create`**`(path, data)`
        - creates a file or a directory depending on if the path ends in /.
    2. **`<directory>.read`**`(path)`
        - gets contents of a directory
    3. **`<directory>.update`**`(oldPath, newPath)`
        - updates the name of a directory
    4. **`<directory>.remove`**`(path)`
        - deletes a directory
    5. **`<file>.read`**`(path)`
        - reads contents of a file
    6. **`<file>.update`**`(path, data)`
        - updates a file with new contents
    7. **`<file>.remove`**`(path)`
        - deletes a file
    7. **`root`**`()`
        - gets the root folder for the File Store

### the resolver

Soul framework also has a resolver in which the components will be registered.

**`code/resolver`** resolves the component dependencies and is responsible for starting any application built on top of 
them. This module has the below functions

1. **`register`**`(name, component)`
    - registers a component.
2. **`resolve`**`(name)`
    - gets the dependency by name
3. **`run`**`()`
    - runs the Runnable components in the resolver