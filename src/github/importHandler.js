'use strict';
const fs = require('fs');
const path = require('path');
const importStatus = require('./api/importStatus');
const log = require('../utils/log')('import-handler');

const resultFile = path.join(__dirname, '../../importResult.json');

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
    this.startTime = new Date(date.getTime() - 2000);
  }

  startCheckingStatus() {
    importStatus(this.startTime.toISOString(), this._handleStatuses);
  }

  _handleStatuses(results) {
    results.forEach(result => {
      if (this.unhandledIds.has(result.id) && result.status === 'imported') {
        const issueId = this.unhandledIds.get(result.id);
        const githubId = result.issue_url.split('/').pop();
        log.debug(`Marking import as finished: T${issueId} => #${githubId}`);
        this.unhandledIds.delete(result.id);
        this.finishedIds.set(issueId, githubId);
      }
    });

    if (this.unhandledIds.size > 0) {
      log.info('Unfinished imports. Checking again in 30 seconds.');
      setTimeout(this.startCheckingStatus, 30000);
    } else {
      this._writeResults();
    }
  }

  _writeResults() {
    const data = {};
    for (const [k, v] of this.finishedIds) {
      data[k] = v;
    }

    fs.writeFileSync(resultFile, JSON.stringify(data, null, 2));
  }
}

module.exports = new ImportHandler();
