'use strict';
const sqlite3 = require('sqlite3');
const path = require('path');
const log = require('../utils/log')('sqlite');

const db = new sqlite3.Database(path.join(__dirname, '../../build/phabricator.db'));

const USER_QUERY = `
SELECT
  u.phid,
  u.userName AS username,
  u.realName AS realname,
  uea.username AS github_username,
  uea.realName AS github_realname
FROM user AS u
  LEFT JOIN user_externalaccount AS uea ON u.phid = uea.userPHID AND uea.accountType = 'github'
WHERE
  u.isApproved = 1 AND
  u.isDisabled = 0 AND
  u.isSystemAgent = 0
`;

module.exports = function getUsers(callback) {
  db.all(USER_QUERY, (err, rows) => {
    if (err) {
      log.error(err);
      return;
    }

    const result = rows.reduce((prev, curr) => {
      prev[curr.phid] = curr;

      return prev;
    }, {});

    callback(result);
  });
};
