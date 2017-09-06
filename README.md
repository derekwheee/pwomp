# exemplar-cli

A command-line interface for creating, serving, and building [exemplar](https://github.com/frxnz/exemplar) projects.

Exemplar is a lightly-opinionated framework for building static sites.


Installation
------------

```
npm install -g exemplar-cli
```

Usage
-----

After installation the `exemplar` command will be available in your terminal.

You can call `exemplar <command> --help` to find out more about the following commands.


### Create a new project

```
exemplar new my-new-site
```

This will create a new folder `my-new-site`, scaffold the Exemplar project, and install any necessary dependencies.

### Build the project

```
exemplar build
```

This will compile your source folder into an output folder ready to be deployed and served.

### Run the development server

```
exemplar serve
```

This will launch a development server automatically builds your project on file changes and serves the compiled site at <http://localhost:3000/>.