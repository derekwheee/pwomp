const chalk = require('chalk');

class Log {
    constructor(type = 'log', color) {
        const logMap = {
            log : 'log',
            error : 'error',
            warn : 'warn',
            info : 'log',            
        }

        const colorMap = {
            log : 'white',
            error : 'red',
            warn : 'yellow',
            info : 'blue',
        };
        
        this.type = type ? logMap[type] : 'log';
        this.chalk = color ? chalk[color] : chalk[colorMap[type]];

        return (message, isSilent) => {
            if (!isSilent) {
                console[this.type](`🍔  ${this.chalk(message)}`);
            } else {
                this.logSilently(message);
            }
        }
    }

    logSilently(message) {
        // todo: Log to database
        if (process.env.NODE_ENV === 'test') {
            console.log(message);
        }
    }
}

const log = new Log();

log.status = new Log('log', 'cyan');

log.success = new Log('log', 'green');

log.info = new Log('info');

log.error = new Log('error');

log.warn = new Log('warn');

module.exports = log;