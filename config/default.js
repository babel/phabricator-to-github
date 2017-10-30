'use strict';

module.exports = {
  // api key with at least repo permission
  apiKey: '',
  target: {
    // the issues from this repository will be migrated
    repository: 'danez/babel',
    // Additional labels to add to the imported issues
    additionalLabels: ['imported'],
  },
  source: {
    // the issues will be migrated to this repo
    repository: 'babel/babylon',
    // Should issues be closed after moving
    close: true,
    // Should issues be locked after moving: false, true, "all"
    lock: true,
    // Add comment to moved issues in source reposiotry: callback or null
    comment: (repository, issueNumber) => `This issue has been moved to ${repository}#${issueNumber}.`,
  },
  // not used right now
  safeMode: true,
};
