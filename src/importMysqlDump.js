'use strict';
const fs = require('fs');
const path = require('path');
const convertToSqlite = require('./import/convertToSqlite');
const DumpExecutor = require('./sqlite/DumpExecutor');
const dropDatabase = require('./sqlite/dropDatabase');
const log = require('./utils/log')('import');
const byline = require('byline');

const targetFile = path.join(__dirname, '../build/sqlitedump.sql');
const dbFile = path.join(__dirname, '../build/phabricator.db');

module.exports = function importDump(file, clear) {
  convertToSqlite(file, targetFile, err => {
    if (err) {
      log.error(err);
      return;
    }

    function doImport() {
      const executor = new DumpExecutor({ debug: true, filename: dbFile });

      log.info('Start importing data into sqlite');
      let stream = fs.createReadStream(targetFile, { encoding: 'utf8' });
      stream = byline.createStream(stream, { keepEmptyLines: true });

      stream
        .on('error', log.error)
        .on('data', executor.addLine)
        .on('end', () => {
          executor.finish();
          log.info('Finished import');
        });
    }

    if (clear) {
      dropDatabase(dbFile, doImport);
    } else {
      doImport();
    }
  });
};
