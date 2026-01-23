/**
 * Production-safe logging utility
 * Provides structured logging with different levels and environment-aware output
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[37m', // White
  RESET: '\x1b[0m'
};

class Logger {
  constructor() {
    this.level = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  getLogLevel() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    return LOG_LEVELS[envLevel] !== undefined ? LOG_LEVELS[envLevel] : LOG_LEVELS.INFO;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = this.isDevelopment 
      ? `${LOG_COLORS[level]}[${level}]${LOG_COLORS.RESET}` 
      : `[${level}]`;
    
    let formattedMessage = `${timestamp} ${prefix} ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` ${data}`;
      }
    }
    
    return formattedMessage;
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.level;
  }

  error(message, data = null) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message, data));
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }

  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  // Utility methods for common logging patterns
  apiRequest(method, path, userId = null) {
    this.info(`API ${method} ${path}`, userId ? { userId } : null);
  }

  apiResponse(method, path, statusCode, duration = null) {
    const level = statusCode >= 400 ? 'ERROR' : 'INFO';
    const message = `API ${method} ${path} - ${statusCode}`;
    const data = duration ? { duration: `${duration}ms` } : null;
    
    if (level === 'ERROR') {
      this.error(message, data);
    } else {
      this.info(message, data);
    }
  }

  dbQuery(operation, collection, query = null) {
    this.debug(`DB ${operation} on ${collection}`, query);
  }

  authEvent(event, userId, details = null) {
    this.info(`Auth: ${event}`, { userId, ...details });
  }

  securityEvent(event, details) {
    this.warn(`Security: ${event}`, details);
  }
}

// Export singleton instance
module.exports = new Logger();