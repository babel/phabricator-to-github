'use strict';
const https = require('https');
const config = require('../../config/config'); // eslint-disable-line import/no-unresolved
const log = require('../utils/log')('github');

module.exports = function importIssue(issue, comments = []) {
  const options = {
    host: 'api.github.com',
    path: `/repos/${config.repository}/import/issues`,
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.golden-comet-preview+json',
      Authorization: `token ${config.apiKey}`,
      'User-Agent': 'Phabricator2Github (github.com/babel/phabricator-to-github)',
    },
  };

  const callback = response => {
    let str = '';
    response.on('data', chunk => { str += chunk; });
    response.on('end', () => log.info(str));
  };

  https.request(options, callback).end(JSON.stringify({ issue, comments }));
};
