'use strict';
const eachIssue = require('./sqlite/eachIssue');
// const importIssue = require('./github/api/importIssue');
const log = require('./utils/log')('migrate');

module.exports = function migrateOld() {
  log.info('Starting importing new comments');

  eachIssue(
    (issue, comments) => {
      // log.debug(issue);
      // log.debug(comments);

      delete issue.authorPHID;
      delete issue.id;
      issue.title = `${issue.title} (T${issue.id})`;
      issue.body = (issue.header || '') + issue.body;
      delete issue.header;

      comments.forEach(comment => {
        delete comment.authorPHID;
        delete comment.commentVersion;
      });

      // importIssue(issue, comments);
    },
    'mt.id > 6000'
  );
};
