'use strict';
const fs = require('fs-extra');
const path = require('path');
const importStatus = require('./api/importStatus');
const log = require('../utils/log')('import-handler');

const resultFile = path.join(__dirname, '../../redirects/importResult.json');

class ImportHandler {

  constructor() {
    this.unhandledIds = new Map();
    this.finishedIds = new Map();
    this.startTime = null;

    this._handleStatuses = this._handleStatuses.bind(this);
    this.startCheckingStatus = this.startCheckingStatus.bind(this);
  }

  addImportId(id, issueId) {
    this.unhandledIds.set(id, issueId);
  }

  setStartTime(date) {
    this.startTime = new Date(date.getTime() - 10000);
  }

  startCheckingStatus() {
    importStatus(this.startTime.toISOString(), this._handleStatuses);
  }

  getTimeout() {
    if (this.unhandledIds.size > 100) return 360000;
    else if (this.unhandledIds.size > 50) return 240000;
    else if (this.unhandledIds.size > 25) return 120000;
    else if (this.unhandledIds.size > 15) return 60000;
    else if (this.unhandledIds.size > 5) return 30000;

    return 10000;
  }

  _handleStatuses(results) {
    results.forEach(result => {
      if (this.unhandledIds.has(result.id)) {
        if (result.status === 'imported') {
          const issueId = this.unhandledIds.get(result.id);
          const githubId = result.issue_url.split('/').pop();
          log.debug(`Marking import as finished: T${issueId} => #${githubId}`);
          this.unhandledIds.delete(result.id);
          this.finishedIds.set(issueId, githubId);
        } else {
          log.debug(`Status for issue ${this.unhandledIds.get(result.id)} is "${result.status}"`);
        }
      }
    });

    if (this.unhandledIds.size > 0) {
      const timeout = this.getTimeout();
      log.info(`Unfinished imports. Checking again in ${timeout / 1000} seconds.`);
      setTimeout(this.startCheckingStatus, timeout);
    } else {
      this._writeResults();
    }
  }

  _writeResults() {
    const data = {};
    for (const [k, v] of this.finishedIds) {
      data[k] = v;
    }

    fs.mkdirsSync(path.dirname(resultFile));
    fs.writeFileSync(resultFile, JSON.stringify(data, null, 2));
  }
}

module.exports = new ImportHandler();
