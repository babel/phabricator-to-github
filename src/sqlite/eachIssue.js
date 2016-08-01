'use strict';
const sqlite3 = require('sqlite3');
const path = require('path');
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
  mt.dateModified AS modified_at
FROM maniphest_task AS mt
ORDER BY id
`;

const COMMENT_QUERY = `
SELECT
  mtc.content AS body,
  mtc.authorPHID as creator,
  mtc.dateCreated AS created_at
FROM maniphest_transaction AS mt
INNER JOIN maniphest_transaction_comment AS mtc ON mt.commentPHID = mtc.phid
WHERE mt.transactionType = "core:comment" AND mt.objectPHID = ?
GROUP BY mtc.transactionPHID
ORDER BY mtc.dateCreated, mtc.commentVersion
`;

module.exports = function eachIssue(callback, complete) {
  const rowCallback = (err, row) => {
    if (err) {
      log.error(err);
      return;
    }

    db.all(COMMENT_QUERY, row.phid, (commentErr, rows) => {
      if (commentErr) {
        log.error(commentErr);
        return;
      }

      const issue = row;
      issue.created_at = (new Date(issue.created_at * 1000)).toISOString();
      issue.modified_at = (new Date(issue.modified_at * 1000)).toISOString();
      delete issue.phid;

      if (issue.status !== 'open') {
        issue.closed = true;
        // TODO closed at
      }
      delete issue.status;

      const comments = rows || [];

      comments.forEach(comment => {
        comment.created_at = (new Date(comment.created_at * 1000)).toISOString();
      });

      issue.comments = comments;

      callback(issue);
    });
  };

  const completeCallback = (err, count) => {
    if (err) {
      log.error(err);
      return;
    }

    log.verbose(`Retrieved ${count} rows from database.`);
    complete(count);
  };

  db.each(ISSUE_QUERY, rowCallback, completeCallback);
};
