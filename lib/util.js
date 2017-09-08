const path = require('path');

module.exports = {
    normalizePath : function(filepath) {
        return path.resolve(filepath);
    }
}