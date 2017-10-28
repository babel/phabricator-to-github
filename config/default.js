'use strict';

module.exports = {
  // api key with at least repo permission
  apiKey: '',
  // the issues from this repository will be migrated
  target: 'danez/babel',
  // the issues will be migrated to this repo
  source: 'babel/babylon',
  // not used right now
  safeMode: true,
  // Additional labels to add to the imported issues
  additionalLabels: ['imported'],
};
