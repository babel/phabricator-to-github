#!/usr/bin/env node
'use strict';
const program = require('commander');
const pjson = require('../package.json');

program
  .version(pjson.version)
  .command('dump', 'Dump all')
  .command('filter', 'Filter all')
  .command('migrate', 'Migrate new phabricator issues to Github')
  .command('close', 'Close')
  .parse(process.argv);
