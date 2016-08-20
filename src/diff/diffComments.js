'use strict';
const log = require('../utils/log')('diff');

module.exports = function diffComments(phabiractorComments, githubComments = [], githubIssue) {
  if (
    githubIssue.comments === 0 &&
    githubComments.length === 0 &&
    phabiractorComments.length === 0
  ) {
    // no comments nowhere
    return [];
  }

  if (githubComments.length !== githubIssue.comments) {
    throw new Error('Initial import seems to be incorrect');
  }

  if (phabiractorComments.length < githubComments.length) {
    throw new Error('Comments in phabricator missing/removed');
  }

  const diffs = [];

  phabiractorComments.forEach((pComment, index) => {
    if (!githubComments[index]) {
      diffs.push(['create_comment', pComment.body]);
    } else if (/* pComment.commentVersion > 1 && */pComment.body !== githubComments[index].body) {
      // TODO enable commentVersion check
      // Currently disabled to see if this diffing works and if we catched all quote/newline issues
      const unmigratedBody = pComment.body.replace(
        /^> Comment originaly made by \*\*.+\*\* on \/\/\d{4}(-\d{2}){2} \d{2}(:\d{2}){2}\/\/\n\n/,
        ''
      ).replace(/\r/g, '');
      if (unmigratedBody !== githubComments[index].body.replace(/\r/g, '')) {
        log.debug(JSON.stringify(pComment, null, 4));
        githubComments[index].user = null;
        log.debug(JSON.stringify(githubComments[index], null, 4));
      }
    }
  });

  if (diffs.length > 0) {
    log.debug(githubIssue.number, diffs);
  }

  return diffs;
};
