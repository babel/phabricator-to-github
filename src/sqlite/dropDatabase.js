'use strict';
const fs = require('fs');

module.exports = function dropDatabase(databaseFile, log, callback) {
  fs.unlink(databaseFile, () => {
    log.info('Dropped current database.');
    if (callback) callback();
  });
};
