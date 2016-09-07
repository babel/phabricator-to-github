'use strict';
const eachIssue = require('./sqlite/eachIssue');
const importIssue = require('./github/api/importIssue');
const log = require('./utils/log')('migrate');
const importHandler = require('./github/importHandler');

module.exports = function migrateOld() {
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

      importIssue(issue, filteredComments, issueId, done);
    },
    () => {
      log.info('Import done, waiting for results ...');
      importHandler.startCheckingStatus();
    },
    'mt.id > 6000'
  );
};
