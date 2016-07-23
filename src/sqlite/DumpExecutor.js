'use strict';
const sqlite3 = require('sqlite3');

module.exports = class DumpExecutor {

  constructor(opts, log) {
    this._log = log;
    this._queuedLines = [];
    this._queuedQueries = [];
    this._database = null;

    this.opts = opts;

    this.addData = this.addData.bind(this);
  }

  addData(data) {
    // start opening the database
    if (!this._database) this._getOpenDatabase();

    const lines = data.toString()
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line !== '');

    lines.forEach(line => {
      this._addLine(line);
    });

    this._tryExecute();
  }

  _addLine(line) {
    this._queuedLines.push(line);
    if (line.endsWith(';')) {
      this._queuedQueries.push(this._queuedLines.join(' '));
      this._queuedLines = [];
    }
  }

  _getOpenDatabase(callback) {
    if (!this._database) {
      const sqlite = this.opts.debug ? sqlite3.verbose() : sqlite3;
      if (!this.opts.filename) throw Error('Missing options "filename" for DumpExecutor');

      this._database = new sqlite.Database(this.opts.filename, () => {
        this._log.debug('Database opened');
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
        this._log.debug('Execute query', query);
        database.exec(query);
      });

      this._queuedQueries = [];
    });
  }
};
