'use strict';
const eachIssue = require('./sqlite/eachIssue');
const diffIssue = require('./diff/diffIssue');
const diffComments = require('./diff/diffComments');
// const importIssue = require('./github/importIssue');
const log = require('./utils/log')('migrate');
const issues = require('../issues.json');
const githubComments = require('../comments.json');

module.exports = function migrate() {
  log.info('Starting calculating diffs for issues <= 3086');
  eachIssue(
    (issue, comments) => {
      // log.debug(issue);
      // log.debug(comments);

      if (issue.id === 596) {
        // This is the "name issue" which seems it hasn't
        // been imported completely into phabricator.
        // >10 comments missing in phabricator.
        return;
      }

      if (!issues[issue.id]) {
        log.verbose(`Issue not found ${issue.id}. Probably was a pull request.`);
        return;
      }

      const issueDiffs = diffIssue(issue, issues[issue.id]);
      const commentDiffs = diffComments(comments, githubComments[issue.id], issues[issue.id]);

      delete issue.creator;
      delete issue.id;
      issue.title = `${issue.title} (T${issue.id})`;

      comments.forEach(comment => {
        delete comment.creator;
        delete comment.commentVersion;
      });

      // importIssue(issue, comments);
    },
    'mt.id <= 3086'
  );
};
