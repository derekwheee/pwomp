module.exports = {
    normalizePath : function(path) {
        path = path.replace(/\\/g, '/')

        if (path.match(/^\w/)) {
            path = `./${path}`;
        }

        if (path.match(/^\//)) {
            path = `.${path}`;
        }

        return path;
    }
}