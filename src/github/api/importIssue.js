'use strict';
const https = require('https');
const config = require('../../../config/config'); // eslint-disable-line import/no-unresolved
const log = require('../../utils/log')('github');
const importHandler = require('../importHandler');

module.exports = function importIssue(issue, comments = [], issueId, callback, retry = true) {
  const options = {
    host: 'api.github.com',
    path: `/repos/${config.target}/import/issues`,
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.golden-comet-preview+json',
      Authorization: `token ${config.apiKey}`,
      'User-Agent': 'Phabricator2Github (github.com/babel/phabricator-to-github)',
    },
  };

  const handler = response => {
    if (response.statusCode !== 202) {
      response.on('data', data => log.error(data.toString()));
      log.error(`${response.statusCode} ${response.statusMessage}`);

      if (retry) {
        log.info('Retrying in 1 minute');
        setTimeout(() => {
          importIssue(issue, comments, callback, false);
        }, 60000);
      } else if (callback) callback();

      return;
    }

    let str = '';
    response.on('data', chunk => { str += chunk; });
    response.on('end', () => {
      const resp = JSON.parse(str);
      importHandler.addImportId(resp.id, issueId);
      if (callback) callback();
    });
  };

  const request = https.request(options, handler);

  request.on('error', (e) => {
    log.error(`problem with request: ${e.message}`);
  });

  request.end(JSON.stringify({ issue, comments }));
};
