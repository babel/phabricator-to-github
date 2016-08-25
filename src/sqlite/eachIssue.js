'use strict';
const sqlite3 = require('sqlite3');
const path = require('path');
const async = require('async');
const log = require('../utils/log')('sqlite');

const db = new sqlite3.Database(path.join(__dirname, '../../build/phabricator.db'));

const ISSUE_QUERY = `
SELECT
  mt.id,
  mt.phid,
  mt.authorPHID as creator,
  mt.title,
  mt.status,
  mt.description AS body,
  mt.dateCreated AS created_at,
  mt.dateModified AS updated_at
FROM maniphest_task AS mt
-- exclude Parser issues
LEFT JOIN edge ON mt.phid = edge.src AND edge.dst = 'PHID-PROJ-msdjjebxwkxh47dgivqi'
WHERE edge.src IS NULL 
-- exclude invalid issues
AND mt.status != 'invalid'
-- Do not export hidden tasks
AND mt.viewPolicy = 'public'
`;

const ISSUE_ORDER = ' ORDER BY id';

const COMMENT_QUERY = `
SELECT
  mtc.content AS body,
  mtc.authorPHID AS creator,
  mtc.dateCreated AS created_at,
  mtc.commentVersion AS commentVersion
FROM maniphest_transaction AS mt
INNER JOIN maniphest_transaction_comment AS mtc ON mt.commentPHID = mtc.phid
WHERE mt.transactionType = "core:comment" AND 
  mt.objectPHID = ? AND
  mtc.isDeleted = 0
GROUP BY mtc.transactionPHID
-- select only the latest version of the comment by sorting
ORDER BY mtc.id, mtc.commentVersion
`;

const CLOSE_DATE_QUERY = `
SELECT dateModified
FROM maniphest_transaction
WHERE objectPHID = ?
AND (
  (
    transactionType = 'status' AND newValue != '"open"'
  ) 
  OR
  (
    transactionType = 'mergedinto'
  )
)
ORDER BY dateCreated desc
LIMIT 1
`;

function createGithubIssue(row) {
  const issue = Object.assign({}, row);
  issue.created_at = (new Date(issue.created_at * 1000)).toISOString();
  issue.updated_at = (new Date(issue.updated_at * 1000)).toISOString();
  if (issue.status !== 'open') issue.closed = true;

  const labels = [];
  if (
    issue.status === 'duplicate' ||
    issue.status === 'wontfix'
  ) {
    labels.push(issue.status);
  }

  delete issue.status;
  delete issue.phid;

  return issue;
}

function createGithubComments(rows) {
  let comments = rows || [];

  comments = comments.map(comment => Object.assign(
    {},
    comment,
    { created_at: (new Date(comment.created_at * 1000)).toISOString() }
  ));

  return comments;
}

module.exports = function eachIssue(callback, complete, filter) {
  const queueWorker = (row, done) => {
    db.all(COMMENT_QUERY, row.phid, (commentErr, rows) => {
      if (commentErr) {
        log.error(commentErr);
        return;
      }

      const issue = createGithubIssue(row);
      const comments = createGithubComments(rows);

      if (issue.closed) {
        db.get(CLOSE_DATE_QUERY, row.phid, (closeErr, dateRow) => {
          if (closeErr) {
            log.error(closeErr);
            return;
          }
          if (!dateRow) {
            log.error(`No close date found for ${row.phid}`);
          } else {
            issue.closed_at = (new Date(dateRow.dateModified * 1000)).toISOString();
          }

          callback(issue, comments, done);
        });
      } else {
        callback(issue, comments, done);
      }
    });
  };

  const issueQueue = async.queue(queueWorker, 1);

  issueQueue.drain = complete;

  const rowCallback = (err, row) => {
    if (err) {
      log.error(err);
      return;
    }

    issueQueue.push(row);
  };

  let query = ISSUE_QUERY;
  if (filter) query += ` AND ${filter}`;
  query += ISSUE_ORDER;

  db.each(query, rowCallback, err => { if (err) log.error(err); });
};
