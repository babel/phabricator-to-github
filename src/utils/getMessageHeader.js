'use strict';
const config = require('../../config/config');

function getIssueHeader(issue) {
  return `> Issue originally reported by @${issue.user.login} in ${config.source.repository}#${issue.number}\n\n`;
}

function getCommentHeader(comment) {
  return `> Comment originally made by @${comment.user.login}\n\n`;
}

exports.getIssueHeader = getIssueHeader;
exports.getCommentHeader = getCommentHeader;
