const chalk = require('chalk');
const winston = require('winston');
let _logger = console;

winston.add(winston.transports.File, { filename: './exemplar.log' });
winston.remove(winston.transports.Console);

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
                _logger[this.type](`🍔  ${this.chalk(message)}`);
            } else {
                this.logSilently(message);
            }
            winston.log(this.type, message, { timestamp : Date.now() });
        }
    }

    logSilently(message) {
        winston.log('debug', message, { timestamp : Date.now() });
    }
}

const log = new Log();
log.status = new Log('log', 'cyan');
log.success = new Log('log', 'green');
log.info = new Log('info');
log.error = new Log('error');
log.warn = new Log('warn');

module.exports = log;