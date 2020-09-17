const debug = require('debug');

class Logger {
  constructor(prefix) {
    this._debug = debug(`${prefix}`);
    this._info = debug(`INFO:${prefix}`);
    this._warn = debug(`WARN:${prefix}`);
    this._error = debug(`ERROR:${prefix}`);
  }

  get debug() {
    return this._debug;
  }

  get info() {
    return this._info;
  }

  get warn() {
    return this._warn;
  }

  get error() {
    return this._error;
  }
}

module.exports = Logger;
