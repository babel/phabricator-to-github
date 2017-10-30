'use strict';

const header = require('../utils/getMessageHeader');
const config = require('../../config/config');

/*
"issue": {
    "title": "Imported from some other system",
    "body": "...",
    "created_at": "2014-01-01T12:34:58Z",
    "closed_at": "2014-01-02T12:24:56Z",
    "updated_at": "2014-01-03T11:34:53Z",
    "assignee": "jonmagic",
    "milestone": 1,
    "closed": true,
    "labels": [
      "bug",
      "low"
    ]
  },
  "comments": [
    {
      "created_at": "2014-01-02T12:34:56Z",
      "body": "talk talk"
    }
  ]
*/

function createIssue(rawIssue) {
  const issue = {
    title: rawIssue.title,
    body: `${header.getIssueHeader(rawIssue)}${rawIssue.body}`,
    created_at: rawIssue.created_at,
    closed: rawIssue.state === 'closed',
    labels: rawIssue.labels.map(label => label.name).concat(config.target.additionalLabels),
  };

  if (rawIssue.closed_at) issue.closed_at = rawIssue.closed_at;
  if (rawIssue.updated_at) issue.updated_at = rawIssue.updated_at;

  return issue;
}

function createComment(comment) {
  return {
    body: `${header.getCommentHeader(comment)}${comment.body}`,
    created_at: comment.created_at,
  };
}

exports.createIssue = createIssue;
exports.createComment = createComment;
