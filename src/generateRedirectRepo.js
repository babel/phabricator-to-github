'use strict';
const fs = require('fs-extra');
const path = require('path');
// eslint-disable-next-line import/no-unresolved
const redirects = require('../redirects/importResult.json');
const config = require('../config/config'); // eslint-disable-line import/no-unresolved
const log = require('./utils/log')('generate redirects');

const resultPath = path.join(__dirname, '../redirects');

module.exports = function generateRedirectRepo() {
  for (let i = 1; i <= 3086; i++) {
    const issuePath = path.join(resultPath, `T${i}`);
    const itemUrl = `https://github.com/${config.repository}/issues/${i}`;

    const template = `<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="${itemUrl}">
<meta http-equiv="refresh" content="0; url=${itemUrl}">
<h1>Redirecting…</h1>
<a href="${itemUrl}">Click here if you are not redirected.</a>
<script>location="${itemUrl}"</script>
</html>
`;
    fs.mkdirs(issuePath, err => {
      if (err) {
        log.error(err);
        return;
      }
      fs.writeFile(path.join(issuePath, 'index.html'), template, writeErr => {
        if (writeErr) log.error(writeErr);
      });
    });
  }

  Object.keys(redirects).forEach(issueId => {
    const githubId = redirects[issueId];
    const issuePath = path.join(resultPath, `T${issueId}`);
    fs.mkdirs(issuePath, err => {
      if (err) {
        log.error(err);
        return;
      }

      const itemUrl = `https://github.com/${config.repository}/issues/${githubId}`;

      const template = `<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="${itemUrl}">
<meta http-equiv="refresh" content="0; url=${itemUrl}">
<h1>Redirecting…</h1>
<a href="${itemUrl}">Click here if you are not redirected.</a>
<script>location="${itemUrl}"</script>
</html>
`;

      fs.writeFile(path.join(issuePath, 'index.html'), template, writeErr => {
        if (writeErr) log.error(writeErr);
      });
    });
  });

  const indexTemplate = `<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="https://github.com/${config.repository}/issues">
<meta http-equiv="refresh" content="0; url=https://github.com/${config.repository}/issues">
<h1>Redirecting…</h1>
<a href="https://github.com/${config.repository}/issues">Click here if you are not redirected.</a>
<script>location="https://github.com/${config.repository}/issues"</script>
</html>
`;

  fs.mkdirs(resultPath, err => {
    if (err) {
      log.error(err);
      return;
    }
    fs.writeFile(path.join(resultPath, 'index.html'), indexTemplate, writeErr => {
      if (writeErr) log.error(writeErr);
    });
  });
};
