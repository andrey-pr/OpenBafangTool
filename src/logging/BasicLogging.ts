if (process.env.WEB_MODE) {
    module.exports = require('./web/BasicLogging');
} else {
    module.exports = require('./electron/BasicLogging');
}