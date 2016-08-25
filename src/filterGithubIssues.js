'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
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

  const issuesById = {};

  issues.forEach(issue => {
    if (issuesById[issue.number]) {
      log.error('Duplicate issues');
    }
    issuesById[issue.number] = issue;
  });

  fs.writeFileSync(path.join(__dirname, '../issues.json'), JSON.stringify(issuesById));
  log.info('All issues filtered and written to issues.json');
};
