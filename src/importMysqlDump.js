'use strict';
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const formatCliMessages = require('./utils/formatCliMessages');

const targetFile = 'build/sqlitedump.sql';

module.exports = function importDump(file, log) {
  log.info(`Deleting old ${targetFile}`);
  fs.unlinkSync(targetFile);

  log.info('Create directory /build');
  fs.mkdir(path.join(__dirname, '../build'), () => {
    log.info('Start converting mysql dump to sqlite');

    const convert = exec(
      `${path.join(__dirname, '../bin/mysql2sqlite')} ${file} > ${targetFile}`
    );

    convert.stdout.on('data', formatCliMessages(log.verbose));
    convert.stderr.on('data', formatCliMessages(log.error));

    convert.on('close', () => {
      log.info('Finished converting');
    });
  });
};
