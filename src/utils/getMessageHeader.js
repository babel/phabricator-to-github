'use strict';

module.exports = function getMessageHeader(type, user) {
  return `> ${type} originally made by @${user.login}\n\n`;
};
