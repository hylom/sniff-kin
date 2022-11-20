import { inspect } from 'util';

const SEVERITIES = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

class Logger {
  constructor() {
    // default log level is 6 (info)
    this.logLevel = 6;
    if (process.env.DEBUG && process.env.DEBUG != '0') {
      this.logLevel = 7;
    }
  }
  
  debug(...args) {
    this._outputLogMessage('debug', ...args);
  }

  info(...args) {
    this._outputLogMessage('info', ...args);
  }

  notice(...args) {
    this._outputLogMessage('notice', ...args);
  }

  warn(...args) {
    this._outputLogMessage('warning', ...args);
  }

  error(...args) {
    this._outputLogMessage('error', ...args);
  }

  critical(...args) {
    this._outputLogMessage('critial', ...args);
  }

  alert(...args) {
    this._outputLogMessage('alert', ...args);
  }

  energency(...args) {
    this._outputLogMessage('emergency', ...args);
  }

  _outputLogMessage(severity, ...args) {
    const level = SEVERITIES[severity];
    if (level === undefined) {
      console.log(`invalid severity: ${severity}.`);
    }
    if (level <= this.logLevel) {
      console.log(this._formatLog(severity, ...args));
    }
  }

  _inspect(obj) {
    if (typeof obj === 'object') {
      return inspect(obj, false, null);
    }
    return obj;
  }

  _formatLog(severity, ...args) {
    const outputs = [];
    outputs.push(new Date().toISOString());
    outputs.push(`[${severity}]`);
    return outputs.concat(args.map(this._inspect)).join(' ');
  }

}

export const logger = new Logger();
