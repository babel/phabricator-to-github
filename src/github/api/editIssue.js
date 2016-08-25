'use strict';
const https = require('https');
const config = require('../../../config/config'); // eslint-disable-line import/no-unresolved
const log = require('../../utils/log')('github');

module.exports = function editIssue(issueId, issue, callback, retry = true) {
  const options = {
    host: 'api.github.com',
    path: `/repos/${config.repository}/issues/${issueId}`,
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${config.apiKey}`,
      'User-Agent': 'Phabricator2Github (github.com/babel/phabricator-to-github)',
    },
  };

  const request = https.request(options, response => {
    response.on('error', err => log.error(err));

    if (response.statusCode !== 200) {
      response.on('data', data => log.error(data.toString()));
      log.error(`(#${issueId}) ${response.statusCode} ${response.statusMessage}`);

      if (retry) {
        log.info('Retrying in 1 minute');
        setTimeout(() => {
          editIssue(issueId, issue, callback, false);
        }, 60000);
      }
      return;
    }

    log.info(`Finished request to edit issue ${issueId}`);
    if (callback) callback();
  });

  request.on('error', (e) => {
    log.error(`problem with request: ${e.message}`);
  });

  request.end(JSON.stringify(issue));
};
