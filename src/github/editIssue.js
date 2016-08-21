'use strict';
const https = require('https');
const config = require('../../config/config'); // eslint-disable-line import/no-unresolved
const log = require('../utils/log')('github');

module.exports = function createComment(issueId, changes, callback) {
  const options = {
    host: 'api.github.com',
    path: `/repos/:${config.repository}/issues/${issueId}`,
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${config.apiKey}`,
      'User-Agent': 'Phabricator2Github (github.com/babel/phabricator-to-github)',
    },
  };

  const request = https.request(options, response => {
    if (response.status !== 200) {
      log.error(response.statusText);
      return;
    }

    log.info(`Finished request to edit issue ${issueId}`);
    log.debug(changes);
    callback();
  });

  request.on('error', (e) => {
    log.error(`problem with request: ${e.message}`);
  });

  request.write(JSON.stringify(changes))
  .end();
};
