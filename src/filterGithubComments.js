'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const log = require('./utils/log')('filter');
const commentsDirectory = require('./dumpGithubComments').commentsDirectory;

module.exports = function filterGithubComments() {
  const files = glob.sync(path.join(commentsDirectory, '*.json'));

  let comments = [];

  files.forEach(file => {
    log.info(`Import file ${file}`);
    const partlyComments = JSON.parse(fs.readFileSync(file));
    comments = comments.concat(
      partlyComments.filter(comment => !comment.html_url.includes('/pull/'))
    );
  });

  fs.writeFileSync(path.join(__dirname, '../comments.json'), JSON.stringify(comments));
  log.info('All issues filtered and written to comments.json');
};
