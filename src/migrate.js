'use strict';
const eachIssue = require('./sqlite/eachIssue');
const diffIssue = require('./diff/diffIssue');
// const importIssue = require('./github/importIssue');
const log = require('./utils/log')('migrate');
const issues = require('../issues.json');

module.exports = function migrate() {
  log.info('Starting import of x issues');
  eachIssue(
    (issue, comments) => {
      // log.debug(issue);
      // log.debug(comments);

      if (!issues[issue.id]) {
        log.verbose(`Issue not found ${issue.id}. Probably was a pull request.`);
        return;
      }

      diffIssue(issue, issues[issue.id]);

      delete issue.creator;
      delete issue.id;
      issue.title = `${issue.title} (T${issue.id})`;

      comments.forEach(comment => {
        delete comment.creator;
      });

      // importIssue(issue, comments);
    },
    3086
  );
};
