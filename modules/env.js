const fs = require('fs');

function createEnv() {
    if (!fs.existsSync('.env')) {
        fs.copyFileSync('.env-template', '.env');
        console.log('Created .env file. If the default values are not desired, please update the .env file.');
    }
}

module.exports = { createEnv }