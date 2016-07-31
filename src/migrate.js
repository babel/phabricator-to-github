'use strict';
const eachIssue = require('./sqlite/eachIssue');

module.exports = function migrate(loggerFactory) {
  const log = loggerFactory('general');
  eachIssue(
    log,
    (err, issue) => log.info(JSON.stringify(issue, null, 2)),
    (err, count) => log.info(`complete ${count}`)
  );
};
