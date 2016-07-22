#!/usr/bin/env node
'use strict';
const program = require('commander');
const pjson = require('../package.json');

program
  .version(pjson.version)
  .command('import-mysql-dump <file>', 'Import phabricator mysql dump into sqlite')
  .command('migrate', 'Migrate Phabricator issues to Github')
  .command('prune-db', 'Prune sqlite')
  .parse(process.argv);

