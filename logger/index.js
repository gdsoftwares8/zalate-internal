const fs = require('fs');
const path = require("path");
const infoStream = fs.createWriteStream(path.join(__dirname, '../logs/info.txt'), {flags: 'a'});
const errorStream = fs.createWriteStream(path.join(__dirname, '../logs/error.txt'), {flags: 'a'});
const debugStream = fs.createWriteStream(path.join(__dirname, '../logs/debug.txt'), {flags: 'a'});

const info = (...restArgs) => {
    let msg = '';
    console.log(...restArgs);

    restArgs.forEach(arg => {
        arg = typeof arg == 'object' ? arg.toString() : arg;
        msg = `${msg}  ${arg}`;
    })

    const message = new Date().toISOString() + " : " + msg + "\n";
    infoStream.write(message);
    // infoStream.end();
};

const debug = (...restArgs) => {
    let msg = '';
    console.log(...restArgs);

    restArgs.forEach(arg => {
        arg = typeof arg == 'object' ? arg.toString() : arg;
        msg = `${msg}  ${arg}`;
    })

    const message = new Date().toISOString() + " : " + msg + "\n";
    debugStream.write(message);
    // debugStream.end();
};

const error = (...restArgs) => {
    let msg = '';
    console.log(...restArgs);

    restArgs.forEach(arg => {
        arg = typeof arg == 'object' ? arg.toString() : arg;
        msg = `${msg}  ${arg}`;
    })

    const message = new Date().toISOString() + " : " + msg + "\n";
    errorStream.write(message);
    // errorStream.end();
};

module.exports = {
    info: info,
    debug: debug,
    error: error
}