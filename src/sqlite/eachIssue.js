'use strict';
const sqlite3 = require('sqlite3');
const path = require('path');
const log = require('../utils/log')('sqlite');

const db = new sqlite3.Database(path.join(__dirname, '../../build/phabricator.db'));

const ISSUE_QUERY = `
SELECT
  mt.id,
  mt.phid,
  mt.authorPHID,
  mt.title,
  mt.status,
  mt.originalTitle,
  mt.description,
  mt.dateCreated,
  mt.dateModified
FROM maniphest_task AS mt
ORDER BY id
`;

const COMMENT_QUERY = `
SELECT
  mtc.content,
  mtc.authorPHID,
  mtc.dateCreated,
  mtc.dateModified
FROM maniphest_transaction AS mt
INNER JOIN maniphest_transaction_comment AS mtc ON mt.commentPHID = mtc.phid
WHERE mt.transactionType = "core:comment" AND mt.objectPHID = ?
GROUP BY mtc.transactionPHID
ORDER BY mtc.dateCreated, mtc.commentVersion
`;

module.exports = function eachIssue(callback, complete) {
  const rowCallback = (err, row) => {
    const issue = row;
    if (err) {
      log.error(err);
      return;
    }

    db.all(COMMENT_QUERY, row.phid, (commentErr, rows) => {
      delete issue.phid;

      issue.comments = rows;

      log.debug(row);
      callback(row);
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
