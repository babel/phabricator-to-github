'use strict';
const fs = require('fs-extra');
const path = require('path');
const dumpComments = require('./github/api/dumpComments');
const log = require('./utils/log')('dump-comments');

const commentsDirectory = path.join(__dirname, '../comments');

module.exports = function dumpGithubComments() {
  fs.removeSync(commentsDirectory);
  fs.mkdirSync(commentsDirectory);

  log.info('Making initial request');
  dumpComments(commentsDirectory, null, (pages) => {
    if (pages) {
      log.info(`Noticed that there are ${pages} pages`);
      for (let i = 2; i <= pages; i++) {
        log.info(`Making request for page ${i}`);
        dumpComments(commentsDirectory, i);
      }
    }
  });
};

module.exports.commentsDirectory = commentsDirectory;
