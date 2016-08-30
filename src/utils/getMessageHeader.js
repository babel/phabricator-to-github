'use strict';
const getUsers = require('../sqlite/getUsers');
const getCustomFields = require('../sqlite/getCustomFields');

const CUSTOM_FIELD_BABEL_VERSION = '1052Zz9yaLoM';
const CUSTOM_FIELD_NODE_VERSION = 'EPCEWbtsb6Du';
const CUSTOM_FIELD_NPM_VERSION = 'hvwLogsxptpg';
const CUSTOM_FIELD_BABEL_CONFIG = 'l3xQ5yaP8o7Y';
const CUSTOM_FIELD_INPUT_CODE = 'k1RKwrdh_DsL';

let users = null;
function getUser(id, cb) {
  if (!users) {
    getUsers(dbUsers => {
      users = dbUsers;
      cb(users[id]);
    });
  } else {
    cb(users[id]);
  }
}

function formatName(user) {
  let name = user.githubRealname || `${user.realname} (${user.username})`;

  if (user.githubUsername) {
    name = `@${user.githubUsername}`;
  }

  return name;
}

function getUserHeader(type, userPhid, date, callback) {
  getUser(userPhid, user => {
    if (!user) throw new Error('User not found');
    let header = `> ${type} originally made by ${formatName(user)}`;

    if (date) {
      header += ` on ${date}`;
    }

    callback(`${header}\n\n`);
  });
}

module.exports = function getMessageHeader(type, issuePhid, userPhid, date, callback) {
  getUserHeader(type, userPhid, date, userHeader => {
    if (issuePhid) {
      getCustomFields(issuePhid, fields => {
        let bugInformation = '';
        let options = '';
        let input = '';

        fields.forEach(field => {
          switch (field.type) {
            case CUSTOM_FIELD_BABEL_VERSION:
              bugInformation += `* **Babel version:** ${field.value}\n`;
              break;
            case CUSTOM_FIELD_NODE_VERSION:
              bugInformation += `* **Node version:** ${field.value}\n`;
              break;
            case CUSTOM_FIELD_NPM_VERSION:
              bugInformation += `* **npm version:** ${field.value}\n`;
              break;
            case CUSTOM_FIELD_BABEL_CONFIG:
              // eslint-disable-next-line
              options = `### Options\n\n${field.value.includes('```') ? field.value.trim() : (`\`\`\`\n${field.value.trim()}\n\`\`\``)}\n\n`;
              break;
            case CUSTOM_FIELD_INPUT_CODE:
              // eslint-disable-next-line
              input = `### Input code\n\n${field.value.includes('```') ? field.value.trim() : (`\`\`\`js\n${field.value.trim()}\n\`\`\``)}\n\n`;
              break;
            default:
              throw new Error('Unknown custom field');
          }
        });

        if (bugInformation.length > 0) {
          bugInformation = `### Bug information\n\n${bugInformation}\n`;
        }

        callback(`${userHeader}${bugInformation}${options}${input}### Description\n\n`);
      });
    } else {
      callback(userHeader);
    }
  });
};
