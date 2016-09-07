'use strict';
const eachIssue = require('./sqlite/eachIssue');
const importIssue = require('./github/api/importIssue');
const log = require('./utils/log')('migrate');
const importHandler = require('./github/importHandler');

module.exports = function migrate(dryRun = false) {
  importHandler.setStartTime(new Date());
  eachIssue(
    (issue, comments, done) => {
      log.info(`Start importing issue T${issue.id}`);
      const issueId = issue.id;
      delete issue.id;

      delete issue.authorPHID;
      issue.title = `${issue.title} (T${issueId})`;
      issue.body = (issue.header || '') + issue.body;
      delete issue.header;

      const filteredComments = comments
        .filter(comment => comment.body.trim() !== '+1' && comment.body.trim() !== '👍');

      filteredComments.forEach(comment => {
        delete comment.authorPHID;
        delete comment.commentVersion;
        comment.body = (comment.header || '') + comment.body;
        delete comment.header;
      });

      if (!dryRun) importIssue(issue, filteredComments, issueId, done);
      else {
        log.verbose('Dry-Run: Would send github import request now');
        done();
      }
    },
    () => {
      log.info('Import done, waiting for results ...');
      if (!dryRun) importHandler.startCheckingStatus();
      else {
        log.verbose('Dry-Run: Would start watching for import status now');
      }
    },
    'mt.id > 6000'
  );
};
