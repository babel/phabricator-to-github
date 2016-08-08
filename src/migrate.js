'use strict';
const eachIssue = require('./sqlite/eachIssue');
const importIssue = require('./github/importIssue');
const log = require('./utils/log')('migrate');

module.exports = function migrate() {
  log.info('Starting import of x issues');
  eachIssue(
    (issue, comments) => {
      log.debug(issue);
      log.debug(comments);

      delete issue.creator;

      comments.forEach(comment => {
        delete comment.creator;
      });

      importIssue(issue, comments);
    },
    30
  );
};
