if (process.env.WEB_MODE) {
    module.exports = require('./web/ListPorts');
} else {
    module.exports = require('./electron/ListPorts');
}