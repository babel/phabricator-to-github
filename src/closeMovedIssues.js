'use strict';
const async = require('async');
const config = require('../config/config');
const log = require('./utils/log')('migrate');
const sendIssueChanges = require('./github/sendIssueChanges');
const editIssue = require('./github/api/editIssue');
const createComment = require('./github/api/createComment');
const lockIssue = require('./github/api/lockIssue');
const importHandler = require('./github/importHandler');

const importResults = require(importHandler.resultFile);

module.exports = function closeMovedIssues(dryRun = false) {
  log.info('Closing and locking moved issues');
  const changeQueue = async.queue(sendIssueChanges, 1);
  changeQueue.pause();

  let countRequests = 0;
  let doneRequests = 0;

  const getCounter = function getCounter() {
    ++doneRequests;
    const percent = Math.round((doneRequests / countRequests) * 100);

    return `${percent}% (${doneRequests}/${countRequests})`;
  };

  Object.keys(importResults).forEach((issueNumber) => {
    log.info(`Queuing issue change for ${issueNumber}`);
    countRequests++;
    changeQueue.push(cb => {
      log.info(`${getCounter()} Closing ${config.source.repository}#${issueNumber}`);
      if (!dryRun) {
        editIssue(issueNumber, { state: 'closed' }, issue => {
          const comment = config.source.comment && config.source.comment(config.target.repository, issueNumber);
          if (comment) {
            createComment(issueNumber, { body: comment }, () => {
              if (!issue.locked && config.source.lock) {
                lockIssue(issueNumber, () => { cb(); });
              }
            });
          } else if (!issue.locked && config.source.lock) {
            lockIssue(issueNumber, () => { cb(); });
          }
        });
      } else {
        log.verbose('Dry-Run: Would send github requests now');
        cb();
      }
    });
  });
};
