'use strict';
const async = require('async');
const importIssue = require('./github/api/importIssue');
const log = require('./utils/log')('migrate');
const importHandler = require('./github/importHandler');
const issues = require('../issues.json');
const config = require('../config/config.js');
const allCommentsByIssue = require('../comments.json');
const creater = require('./github/createImportIssue');

module.exports = function migrate(dryRun = false, limit = 0) {
  importHandler.setStartTime(new Date());
  const issueQueue = async.queue((issue, done) => {
    log.info(`Start importing ${config.source.repository}#${issue.number}`);
    const comments = allCommentsByIssue[issue.number] || [];

    if (!dryRun) importIssue(creater.createIssue(issue), comments.map(creater.createComment), issue.number, done);
    else {
      log.verbose('Dry-Run: Would send github import request now');
      done();
    }
  }, 1);

  issueQueue.pause();

  issueQueue.drain = () => {
    log.info('Importing done, waiting for results ...');
    if (!dryRun) importHandler.startCheckingStatus();
    else {
      log.verbose('Dry-Run: Would start watching for import status now');
    }
  };

  const limitedIssues = limit > 0 ? issues.slice(0, limit) : issues;

  limitedIssues.forEach(issue => issueQueue.push(issue));
  issueQueue.resume();
};
