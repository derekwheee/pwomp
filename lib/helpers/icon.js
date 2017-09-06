const fs = require('fs');
const config = require('../config');

module.exports = function(path) {
    try {
        return fs.readFileSync(`${config.getPath('iconDir')}min/${path}.svg`, { encoding : 'utf-8' });
    } catch (err) {
        return '';
    }
};