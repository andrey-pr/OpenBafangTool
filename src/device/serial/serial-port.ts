if (process.env.WEB_MODE) {
    module.exports = require('./web/serial-port');
} else {
    module.exports = require('./electron/serial-port');
}//todo
