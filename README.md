# Pwomp

[![Build Status](https://travis-ci.org/frxnz/pwomp.svg?branch=master)](https://travis-ci.org/frxnz/pwomp)

A command-line interface for creating, serving, and building fast websites.

Pwomp is a lightly-opinionated framework for building static sites.


Installation
------------

```
npm install -g pwomp
```

Usage
-----

After installation the `pwomp` command will be available in your terminal.

You can call `pwomp <command> --help` to find out more about the following commands.


### Create a new project

```
pwomp new my-new-site
```

This will create a new folder `my-new-site`, scaffold the Pwomp project, and install any necessary dependencies.

### Build the project

```
pwomp build
```

This will compile your source folder into an output folder ready to be deployed and served.

### Run the development server

```
pwomp serve
```

This will launch a development server automatically builds your project on file changes and serves the compiled site at <http://localhost:3000/>.