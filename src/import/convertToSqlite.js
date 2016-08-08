'use strict';
const path = require('path');
const exec = require('child_process').exec;
const prepareBuildDirectory = require('./prepareBuildDirectory');
const log = require('../utils/log')('convert');

module.exports = function convertToSqlite(file, targetFile, callback) {
  prepareBuildDirectory(targetFile, err => {
    if (err) {
      callback(err);
      return;
    }

    log.info('Start converting mysql dump to sqlite');

    const convert = exec(
      `${path.join(__dirname, '../../bin/mysql2sqlite')} ${file} > ${targetFile}`
    );

    convert.stdout.on('data', log.verbose);
    convert.stderr.on('data', log.error);

    convert.on('close', () => {
      log.info('Finished converting');

      if (callback) callback();
    });
  });
};
