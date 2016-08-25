'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('../../../config/config'); // eslint-disable-line import/no-unresolved
const log = require('../../utils/log')('github');

const linkRegExp = /<https:\/\/api\.github\.com\/[^>]+page=(\d+)>; rel="last"/i;

module.exports = function dumpIssues(directory, page, callback) {
  let pageParam = '';
  if (page) {
    pageParam = `&page=${page}`;
  }

  const options = {
    host: 'api.github.com',
    path: `/repos/${config.repository}/issues/comments?per_page=100${pageParam}`,
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${config.apiKey}`,
      'User-Agent': 'Phabricator2Github (github.com/babel/phabricator-to-github)',
    },
  };

  const fileName = path.join(directory, `${page || 1}.json`);
  const fsStream = fs.createWriteStream(fileName);

  https.request(options, response => {
    let pages;
    if (!page && response.headers.link) {
      const matches = response.headers.link.match(linkRegExp);

      if (matches) {
        pages = matches[1];
      }
    }

    response.pipe(fsStream);

    response.on('end', () => {
      log.info(`Finished request for ${page ? `page ${page}` : 'initial page'}`);
      if (callback) callback(pages);
    });
  })
  .end();
};
