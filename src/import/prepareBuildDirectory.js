'use strict';
const fs = require('fs');
const path = require('path');
const log = require('../utils/log')('prepare-fs');

module.exports = function prepareBuildDirectory(targetFile, callback) {
  log.info(`Deleting old ${targetFile}`);
  fs.unlink(targetFile, () => {
    log.info('Create directory /build');
    fs.mkdir(path.dirname(targetFile), () => callback());
  });
};
