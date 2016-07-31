'use strict';
const eachIssue = require('./sqlite/eachIssue');
const log = require('./utils/log')('migrate');

module.exports = function migrate() {
  eachIssue(
    issue => log.info(JSON.stringify(issue, null, 2)),
    count => log.info(`complete ${count}`)
  );
};
