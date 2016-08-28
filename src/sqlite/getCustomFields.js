'use strict';
const sqlite3 = require('sqlite3');
const path = require('path');
const log = require('../utils/log')('sqlite');

const db = new sqlite3.Database(path.join(__dirname, '../../build/phabricator.db'));

const CUSTOM_FIELD_QUERY = `
SELECT
  cfs.fieldIndex AS type,
  cfs.fieldValue AS value
FROM maniphest_customfieldstorage AS cfs
WHERE
  cfs.objectPHID = ?
`;

module.exports = function getCustomFields(phid, callback) {
  db.all(CUSTOM_FIELD_QUERY, phid, (err, rows) => {
    if (err) {
      log.error(err);
      return;
    }

    callback(rows);
  });
};
