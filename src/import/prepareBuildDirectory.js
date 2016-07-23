'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function importDump(targetFile, log, callback) {
  log.info(`Deleting old ${targetFile}`);
  fs.unlink(targetFile, err => {
    if (err) {
      callback(err);
      return;
    }

    log.info('Create directory /build');
    fs.mkdir(path.dirname(targetFile), () => {
      if (err) callback(err);
      else callback();
    });
  });
};
