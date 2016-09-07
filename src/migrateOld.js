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

module.exports = function migrateOld(dryRun = false) {
  log.info('Starting calculating diffs for issues <= 3086');
  const changeQueue = async.queue(sendIssueChanges, 1);
  changeQueue.pause();

  let countRequests = 0;
  let doneRequests = 0;

  const getCounter = function getCounter() {
    ++doneRequests;
    const percent = Math.round((doneRequests / countRequests) * 100);

    return `${percent}% (${doneRequests}/${countRequests})`;
  };

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
        countRequests++;
        changeQueue.push(cb => {
          log.info(`${getCounter()} Start sending pre-issue change for T${issue.id}`);
          if (!dryRun) editIssue(issue.id, issueChanges, cb);
          else {
            log.verbose('Dry-Run: Would send github request now');
            cb();
          }
        });
      }

      if (commentChanges) {
        log.info(`Queuing comment changes (${commentChanges.length}) for T${issue.id}`);
        countRequests++;
        changeQueue.push(cb => {
          log.info(`${getCounter()} Start sending comment change for T${issue.id}`);
          if (!dryRun) {
            createComment(
              issue.id,
              {
                body: commentChanges.reduce(
                  (prev, curr) => {
                    if (!prev) return curr.body;
                    return `${prev}\n\n<hr />\n\n${curr.body}`;
                  },
                  ''
                ),
              },
              cb
            );
          } else {
            log.verbose('Dry-Run: Would send github request now');
            cb();
          }
        });
      }

      if (issueChanges && (!issueChanges.state || issueChanges.state !== 'open')) {
        // close or title after comments
        log.info(`Queuing issue change for T${issue.id}`);
        countRequests++;
        changeQueue.push(cb => {
          log.info(`${getCounter()} Start sending post-issue change for T${issue.id}`);
          if (!dryRun) editIssue(issue.id, issueChanges, cb);
          else {
            log.verbose('Dry-Run: Would send github request now');
            cb();
          }
        });
      }

      return done();
    },
    () => {
      log.info(`Starting sending ${countRequests} requests in queue`);
      changeQueue.resume();
    },
    'mt.id <= 3086',
    true
  );
};
