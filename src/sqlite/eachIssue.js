'use strict';
const sqlite3 = require('sqlite3');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../build/phabricator.db'));

const ISSUE_QUERY = `
SELECT 
  mt.id, 
  mt.phid, 
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
  mtc.content 
FROM maniphest_transaction AS mt 
INNER JOIN maniphest_transaction_comment AS mtc ON mt.commentPHID = mtc.phid 
WHERE mt.transactionType = "core:comment" AND mt.objectPHID = ?
`;

module.exports = function eachIssue(log, minId, callback, complete) {
  if (typeof minId === 'function') {
    complete = callback; // eslint-disable-line no-param-reassign
    callback = minId; // eslint-disable-line no-param-reassign
  }

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
      callback(err, row);
    });
  };

  const completeCallback = (err, count) => {
    if (err) {
      log.error(err);
      return;
    }

    log.verbose(`Retrieved ${count} rows from database.`);
    complete(err, count);
  };

  db.each(ISSUE_QUERY, rowCallback, completeCallback);
};
