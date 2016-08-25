'use strict';
const fs = require('fs-extra');
const path = require('path');
const dumpIssues = require('./github/api/dumpIssues');
const log = require('./utils/log')('dump-issues');

const issueDirectory = path.join(__dirname, '../issues');

module.exports = function dumpGithubIssues() {
  fs.removeSync(issueDirectory);
  fs.mkdirSync(issueDirectory);

  log.info('Making initial request');
  dumpIssues(issueDirectory, null, (pages) => {
    if (pages) {
      log.info(`Noticed that there are ${pages} pages`);
      for (let i = 2; i <= pages; i++) {
        log.info(`Making request for page ${i}`);
        dumpIssues(issueDirectory, i);
      }
    }
  });
};

module.exports.issueDirectory = issueDirectory;
