'use strict';
const log = require('../utils/log')('diff');

module.exports = function diffIssue(phabiractorIssue, githubIssue) {
  // log.debug(JSON.stringify(phabiractorIssue,null,4));
  // log.debug(JSON.stringify(githubIssue,null,4));
  if (phabiractorIssue.id !== githubIssue.number) {
    throw new Error('Upps');
  }

  const diffs = [];

  if (phabiractorIssue.closed && githubIssue.state !== 'closed') {
    diffs.push('close');
  } else if (!phabiractorIssue.closed && githubIssue.state === 'closed') {
    diffs.push('reopen');
  }

  if (phabiractorIssue.title !== githubIssue.title) {
    diffs.push('title');
  }

  if (diffs.length > 0) {
    log.debug(phabiractorIssue.id);
    log.debug(diffs);
  }

  return diffs;
};
