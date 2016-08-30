#!/usr/bin/env node
'use strict';
const program = require('commander');
const pjson = require('../package.json');

program
  .version(pjson.version)
  .command('dump-github-comments', 'Dump all comments from Github')
  .command('dump-github-issues', 'Dump all issues from Github')
  .command('filter-github-comments', 'Filter and consolidate previously dumped comments')
  .command('filter-github-issues', 'Filter and consolidate previously dumped issues')
  .command('generate-redirect-repo', 'Generates static templates for redirect')
  .command('import-mysql-dump <file>', 'Import phabricator mysql dump into sqlite')
  .command('migrate', 'Migrate new phabricator issues to Github')
  .command('migrate-old', 'Migrate changed phabricator issues to Github')
  .parse(process.argv);

