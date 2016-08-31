'use strict';

module.exports = function diffComments(phabiractorComments, githubComments = [], githubIssue) {
  if (
    githubIssue.comments === 0 &&
    githubComments.length === 0 &&
    phabiractorComments.length === 0
  ) {
    // no comments nowhere
    return null;
  }

  if (githubComments.length !== githubIssue.comments) {
    throw new Error('Initial import seems to be incorrect');
  }

  if (phabiractorComments.length < githubComments.length) {
    throw new Error('Comments in phabricator missing/removed');
  }

  const commentsToSend = [];

  phabiractorComments.forEach((pComment, index) => {
    if (!githubComments[index]) {
      if (pComment.body.trim() === '+1' || pComment.body.trim() === '👍') return;
      commentsToSend.push({ body: (pComment.header || '') + pComment.body });
    } else if (pComment.commentVersion > 1 && pComment.body !== githubComments[index].body) {
      const unmigratedBody = pComment.body.replace(
        /^> Comment originaly made by \*\*.+\*\* on \/\/\d{4}(-\d{2}){2} \d{2}(:\d{2}){2}\/\/\n\n/,
        ''
      ).replace(/\r/g, '');
      if (unmigratedBody !== githubComments[index].body.replace(/\r/g, '')) {
        throw new Error('Imported comment changed in phabricator');
      }
    }
  });

  return commentsToSend.length > 0 ? commentsToSend : null;
};
