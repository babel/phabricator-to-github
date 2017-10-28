'use strict';

const getMessageHeader = require('../utils/getMessageHeader');
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

function createIssue(
  { title, body, created_at, closed_at: closedAt, updated_at: updatedAt, state, labels, user }
) {
  const issue = {
    title,
    body: `${getMessageHeader('Issue', user)}${body}`,
    created_at,
    closed: state === 'closed',
    labels: labels.map(label => label.name).concat(config.additionalLabels),
  };

  if (closedAt) issue.closed_at = closedAt;
  if (updatedAt) issue.updated_at = updatedAt;

  return issue;
}

function createComment({ body, created_at, user }) {
  return {
    body: `${getMessageHeader('Comment', user)}${body}`,
    created_at,
  };
}

exports.createIssue = createIssue;
exports.createComment = createComment;
