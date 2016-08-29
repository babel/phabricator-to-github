'use strict';
const https = require('https');
const config = require('../../../config/config'); // eslint-disable-line import/no-unresolved
const log = require('../../utils/log')('github');

module.exports = function importStatus(startTime, callback) {
  const options = {
    host: 'api.github.com',
    path: `/repos/${config.repository}/import/issues?since=${startTime}`,
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github.golden-comet-preview+json',
      Authorization: `token ${config.apiKey}`,
      'User-Agent': 'Phabricator2Github (github.com/babel/phabricator-to-github)',
    },
  };

  const handler = response => {
    if (response.statusCode !== 200) {
      response.on('data', data => log.error(data.toString()));
      log.error(`${response.statusCode} ${response.statusMessage}`);

      if (callback) callback();
      return;
    }

    let str = '';
    response.on('data', chunk => { str += chunk; });
    response.on('end', () => {
      if (callback) callback(JSON.parse(str));
    });
  };

  const request = https.request(options, handler);

  request.on('error', (e) => {
    log.error(`problem with request: ${e.message}`);
  });

  request.end();
};
