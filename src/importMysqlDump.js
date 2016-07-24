'use strict';
const fs = require('fs');
const path = require('path');
const convertToSqlite = require('./import/convertToSqlite');
const DumpExecutor = require('./sqlite/DumpExecutor');
const dropDatabase = require('./sqlite/dropDatabase');

const targetFile = path.join(__dirname, '../build/sqlitedump.sql');
const dbFile = path.join(__dirname, '../build/phabricator.db');

module.exports = function importDump(file, logFactory) {
  const log = logFactory('import');
  convertToSqlite(file, targetFile, logFactory('convert'), err => {
    if (err) {
      log.error(err);
      return;
    }

    const sqliteLog = logFactory('sqlite');

    dropDatabase(dbFile, sqliteLog, () => {
      const executor = new DumpExecutor({ debug: true, filename: dbFile }, sqliteLog);

      log.info('Start importing data into sqlite');
      fs.createReadStream(targetFile, { encoding: 'utf8' })
        .on('error', log.error)
        .on('data', executor.addData)
        .on('end', () => {
          executor.finish();
          log.info('Finished import');
        });
    });
  });
};
