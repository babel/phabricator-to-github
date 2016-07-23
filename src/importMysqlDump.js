'use strict';
const fs = require('fs');
const path = require('path');
const convertToSqlite = require('./import/convertToSqlite');
const DumpExecutor = require('./sqlite/DumpExecutor');

const targetFile = path.join(__dirname, '../build/sqlitedump.sql');
const dbFile = path.join(__dirname, '../build/phabricator.db');

module.exports = function importDump(file, logFactory) {
  const log = logFactory('import');
  convertToSqlite(file, targetFile, logFactory('convert'), err => {
    if (err) {
      log.error(err);
      return;
    }

    const executor = new DumpExecutor({ debug: true, filename: dbFile }, logFactory('sqlite'));

    fs.createReadStream(targetFile, { encoding: 'utf8' })
      .on('error', log.error)
      .on('data', executor.addData)
      .on('finish', () => log.info('Finished import'));
  });
};
