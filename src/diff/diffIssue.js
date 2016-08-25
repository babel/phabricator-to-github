'use strict';

module.exports = function diffIssue(phabiractorIssue, githubIssue) {
  if (phabiractorIssue.id !== githubIssue.number) {
    throw new Error('Initial import seems to be incorrect');
  }

  const issueToSend = {};

  if (phabiractorIssue.closed && githubIssue.state !== 'closed') {
    issueToSend.state = 'closed';
  } else if (!phabiractorIssue.closed && githubIssue.state === 'closed') {
    issueToSend.state = 'open';
  }

  if (phabiractorIssue.title !== githubIssue.title) {
    issueToSend.title = phabiractorIssue.title;
  }

  if (Object.keys(issueToSend).length === 0) return null;

  return issueToSend;
};
