'use strict';
const async = require('async');
const eachIssue = require('./sqlite/eachIssue');
const diffIssue = require('./diff/diffIssue');
const diffComments = require('./diff/diffComments');
const log = require('./utils/log')('migrate');
const issues = require('../issues.json');
const githubComments = require('../comments.json');
const sendIssueChanges = require('./github/sendIssueChanges');
const editIssue = require('./github/api/editIssue');
const createComment = require('./github/api/createComment');

module.exports = function migrateOld() {
  log.info('Starting calculating diffs for issues <= 3086');
  const changeQueue = async.queue(sendIssueChanges, 1);
  changeQueue.pause();

  eachIssue(
    (issue, comments, done) => {
      if (issue.id === 596) {
        // This is the "name issue" which seems it hasn't
        // been imported completely into phabricator.
        // >10 comments missing in phabricator.
        return done();
      }

      if (!issues[issue.id]) {
        // log.verbose(`Issue not found ${issue.id}. Probably was a pull request.`);
        return done();
      }

      const issueChanges = diffIssue(issue, issues[issue.id]);
      const commentChanges = diffComments(comments, githubComments[issue.id], issues[issue.id]);

      if (issueChanges && issueChanges.state && issueChanges.state === 'open') {
        // open before comments
        log.info(`Queuing issue change for T${issue.id}`);
        changeQueue.push(cb => { editIssue(issue.id, issueChanges, cb); });
      }

      if (commentChanges) {
        log.info(`Queuing comment changes (${commentChanges.length}) for T${issue.id}`);
        commentChanges.forEach(comment => {
          changeQueue.push(cb => { createComment(issue.id, comment, cb); });
        });
      }

      if (issueChanges && (!issueChanges.state || issueChanges.state !== 'open')) {
        // close or title after comments
        log.info(`Queuing issue change for T${issue.id}`);
        changeQueue.push(cb => { editIssue(issue.id, issueChanges, cb); });
      }

      return done();
    },
    () => {
      log.info('Starting send queue');
      changeQueue.resume();
    },
    'mt.id <= 3086',
    true
  );
};
