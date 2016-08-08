'use strict';
const sqlite3 = require('sqlite3');
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
    this._queuedQueries = [];
    this._database = null;
    this._queryCounter = 0;

    this.opts = opts;

    this.addData = this.addData.bind(this);
  }

  addData(data) {
    // start opening the database
    if (!this._database) this._getOpenDatabase();

    const lines = data.toString().split(/\r?\n/);

    lines.forEach(line => {
      this._addLine(line);
    });

    this._tryExecute();
  }

  finish() {
    this._pushLinesToQuery();
    this._queuedLines = [];
    this._tryExecute();
  }

  _startsNewQuery(line) {
    return QUERY_START_TOKENS.some(token => line.startsWith(token));
  }

  _addLine(line) {
    const countQueuedLines = this._queuedLines.length;

    if (countQueuedLines > 0) {
      if (this._startsNewQuery(line)) {
        this._pushLinesToQuery();
        this._queuedLines = [line];
      } else {
        this._queuedLines[countQueuedLines - 1] += line;
      }
    } else {
      this._queuedLines.push(line);
    }
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
    }

    if (callback) {
      if (this._database.open) callback(null, this._database);
      else this._database.once('open', () => callback(null, this._database));
    }
  }

  _tryExecute() {
    if (this._queuedQueries.length === 0) return;

    this._getOpenDatabase((err, database) => {
      this._queuedQueries.forEach(query => {
        log.debug(`#${++this._queryCounter} Execute query`, query);
        database.exec(query, dbErr => {
          if (err) {
            log.error('Query failed', { query, dbErr });
            throw err;
          }
        });
      });

      this._queuedQueries = [];
    });
  }
};
