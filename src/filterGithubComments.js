'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const log = require('./utils/log')('filter');
const commentsDirectory = require('./dumpGithubComments').commentsDirectory;

const hzooBotMessage = `We really appreciate you taking the time to report an issue. The collaborators
on this project attempt to help as many people as possible, but we're a limited number of volunteers,
so it's possible this won't be addressed swiftly.`;

module.exports = function filterGithubComments() {
  const files = glob.sync(path.join(commentsDirectory, '*.json'));

  let comments = [];

  files.forEach(file => {
    log.info(`Import file ${file}`);
    const partlyComments = JSON.parse(fs.readFileSync(file));
    comments = comments.concat(
      partlyComments.filter(
        comment =>
          !comment.html_url.includes('/pull/') &&
          comment.body.trim() !== '+1' &&
          comment.body.trim() !== '👍' &&
          comment.body.indexOf(hzooBotMessage) === -1
      )
    );
  });

  const commentsByIssue = {};

  comments.forEach(comment => {
    const issueNumber = comment.issue_url.match(/\/(\d+)$/i)[1];

    commentsByIssue[issueNumber] = [
      ...(commentsByIssue[issueNumber] || []),
      comment,
    ];
  });

  Object.keys(commentsByIssue).forEach(issueNumber => {
    commentsByIssue[issueNumber] = commentsByIssue[issueNumber].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  });

  fs.writeFileSync(path.join(__dirname, '../comments.json'), JSON.stringify(commentsByIssue));
  log.info('All issues filtered and written to comments.json');
};
