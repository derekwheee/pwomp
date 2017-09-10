const express = require('express');
const config = require('./config');
const log = require('./log')();

function server() {
    const app = express();

    app.use(express.static(config.SETTINGS.outputDir));
    
    return app.listen(config.SETTINGS.server.port, () => {
        log.success(`Server ready at http://localhost:${config.SETTINGS.server.port}`);
    });
}

module.exports = server;