'use strict';
const sqlite3 = require('sqlite3');
const async = require('async');
const log = require('../utils/log')('sqlite');

const QUERY_START_TOKENS = [
  'PRAGMA ',
  'BEGIN TRANSACTION',
  'END TRANSACTION',
  'CREATE TABLE ',
  'CREATE INDEX ',
  'INSERT INTO ',
];

module.exports = class DumpExecutor {

  constructor(opts) {
    this._queuedLines = [];
    this._queuedQueries = async.queue(this._tryExecute.bind(this), 1);
    this._database = null;
    this._queryCounter = 0;

    this.opts = opts;

    this.addLine = this.addLine.bind(this);
  }

  finish() {
    this._pushLinesToQuery();
    this._queuedLines = [];
  }

  _startsNewQuery(line) {
    return QUERY_START_TOKENS.some(token => line.startsWith(token));
  }

  addLine(line) {
    if (this._queuedLines.length > 0 && this._startsNewQuery(line)) {
      this._pushLinesToQuery();
      this._queuedLines = [line];
      return;
    }

    this._queuedLines.push(line);
  }

  _pushLinesToQuery() {
    this._queuedQueries.push(this._queuedLines.join('\n'));
  }

  _getOpenDatabase(callback) {
    if (!this._database) {
      if (!this.opts.filename) throw Error('Missing options "filename" for DumpExecutor');

      this._database = new sqlite3.Database(this.opts.filename, () => {
        log.debug('Database opened');

        if (callback) callback(null, this._database);
      });
    } else if (callback) {
      if (this._database.open) callback(null, this._database);
      else {
        throw new Error('This should not happen');
      }
    }
  }

  _tryExecute(query, done) {
    this._getOpenDatabase((err, database) => {
      log.debug(`#${++this._queryCounter} Execute query`, JSON.stringify(query));
      database.exec(query, dbErr => {
        if (err) {
          log.error('Query failed', { query, dbErr });
          throw err;
        }
        done();
      });
    });
  }
};
