#!/usr/bin/env node
'use strict';
const program = require('commander');
const path = require('path');
const pjson = require('../package.json');
const log = require('../src/utils/log');

function showErrorAndExit(error) {
  console.error(`  error: ${error}`); // eslint-disable-line no-console
  program.outputHelp();
  process.exit(1);
}

let file;

program
  .version(pjson.version)
  .description('Import phabricator mysql dump into sqlite')
  .arguments('<file>')
  .option('-n, --no-clear', 'Do not clear db before')
  .option('-v, --verbose', 'Change log level to verbose')
  .option('-d, --debug', 'Change log level to debug')
  .action(argFile => {
    file = path.resolve(process.cwd(), argFile);
  })
  .parse(process.argv);

if (!file) showErrorAndExit('no file given');

// eslint-disable-next-line no-nested-ternary
const logLevel = program.debug ? 'debug' : (program.verbose ? 'verbose' : 'info');

log.setLogLevel(logLevel);

// require after setting loglevel
const importMysqlDump = require('../src/importMysqlDump');

importMysqlDump(file, program.clear !== false);
