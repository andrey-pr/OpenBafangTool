if (process.env.WEB_MODE) {
    module.exports = {};
} else {
    module.exports = require('../../device/high-level/BafangCanSystem');
}
