# Github to Github [![Build Status](https://travis-ci.org/babel/phabricator-to-github.svg?branch=master)](https://travis-ci.org/babel/phabricator-to-github)

These steps have to be done in exactly this order:

* copy config/default.js to config/config.js and adjust config
* Preprocess (no changes send to github yet)
  * Dump all issues and comments from github to a single file with `phaway dump`
  * Preprocess all issues and comments with `phaway filter`
* Do the actual moving with `phaway migrate --dry-run --debug` (This creates the new issues in the target repository)
* Do post moving jobs such as closing, locking and posting messages with `phaway close --dry-run --debug`
