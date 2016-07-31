'use strict';
const createLoggerFactory = require('./createLoggerFactory');

let loggerFactory = null;

module.exports = label => {
  if (!loggerFactory) loggerFactory = createLoggerFactory('info');

  return loggerFactory(label);
};

module.exports.setLogLevel = level => {
  loggerFactory = createLoggerFactory(level);
};
