'use strict';
const log = require('../utils/log')('send-changes');

module.exports = function sendIssueChanges(worker, done) {
  worker(() => {
    const waitTime = 3000;
    log.debug(`Waiting ${waitTime}ms for next request (github abuse limit)`);
    setTimeout(done, waitTime);
  });
};
