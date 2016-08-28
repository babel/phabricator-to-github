'use strict';
const eachIssue = require('./sqlite/eachIssue');
const importIssue = require('./github/api/importIssue');
const log = require('./utils/log')('migrate');

module.exports = function migrateOld() {
  eachIssue(
    (issue, comments, done) => {
      log.info(`Start importing issue T${issue.id}`);

      delete issue.authorPHID;
      issue.title = `${issue.title} (T${issue.id})`;
      delete issue.id;
      issue.body = (issue.header || '') + issue.body;
      delete issue.header;

      comments.forEach(comment => {
        delete comment.authorPHID;
        delete comment.commentVersion;
        comment.body = (comment.header || '') + comment.body;
        delete comment.header;
      });

      importIssue(issue, comments, done);
    },
    () => {
      log.info('Import done');
    },
    'mt.id > 6000'
  );
};
