'use strict';
const winston = require('winston');

module.exports = level => {
  const container = new winston.Container();

  return label => {
    if (!label) throw new Error('Logger without label not supported');

    const logger = container.get(label, {
      console: {
        label,
        level,
        colorize: true,
        timestamp: true,
      },
    });

    logger.padLevels = true;
    logger.setLevels(winston.config.npm.levels);

    return logger;
  };
};
