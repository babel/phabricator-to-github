#!/usr/bin/env node
'use strict';
const program = require('commander');
const pjson = require('../package.json');
const log = require('../src/utils/log');

program
  .description('Dump all comments from Github')
  .version(pjson.version)
  .option('-v, --verbose', 'Change log level to verbose')
  .option('-d, --debug', 'Change log level to debug')
  .parse(process.argv);

// eslint-disable-next-line no-nested-ternary
const logLevel = program.debug ? 'debug' : (program.verbose ? 'verbose' : 'info');

log.setLogLevel(logLevel);

// require after setting loglevel
const dumpGithubComments = require('../src/dumpGithubComments');

dumpGithubComments();
