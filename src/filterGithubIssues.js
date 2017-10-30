'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const config = require('../config/config');
const log = require('./utils/log')('filter');
const issueDirectory = require('./dumpGithubIssues').issueDirectory;

module.exports = function filterGithubIssues() {
  const files = glob.sync(path.join(issueDirectory, '*.json'));

  let issues = [];

  files.forEach(file => {
    log.info(`Import file ${file}`);
    const partlyIssues = JSON.parse(fs.readFileSync(file));
    issues = issues.concat(partlyIssues.filter(issue => !issue.pull_request));
  });

  if (config.source.filter) {
    issues = issues.filter(config.source.filter);
  }

  fs.writeFileSync(path.join(__dirname, '../issues.json'), JSON.stringify(issues));
  log.info('All issues filtered and written to issues.json');
};
