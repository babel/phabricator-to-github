'use strict';
const log = require('../utils/log')('diff');

module.exports = function diffIssue(phabiractorIssue, githubIssue) {
  if (phabiractorIssue.id !== githubIssue.number) {
    throw new Error('Initial import seems to be incorrect');
  }

  const diffs = [];

  if (phabiractorIssue.closed && githubIssue.state !== 'closed') {
    diffs.push('close');
  } else if (!phabiractorIssue.closed && githubIssue.state === 'closed') {
    diffs.push('reopen');
  }

  if (phabiractorIssue.title !== githubIssue.title) {
    diffs.push(['update_title', phabiractorIssue.title]);
  }

  if (diffs.length > 0) {
    log.debug(phabiractorIssue.id, diffs);
  }

  return diffs;
};
