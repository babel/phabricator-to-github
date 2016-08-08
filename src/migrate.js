'use strict';
const eachIssue = require('./sqlite/eachIssue');
const log = require('./utils/log')('migrate');

module.exports = function migrate() {
  eachIssue(
    (issue, comments) => {
      log.debug(issue);
      log.debug(comments);
    }
  );
};
