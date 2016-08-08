'use strict';
const fs = require('fs');
const log = require('../utils/log')('sqlite');

module.exports = function dropDatabase(databaseFile, callback) {
  fs.unlink(databaseFile, () => {
    log.info('Dropped current database.');
    if (callback) callback();
  });
};
