'use strict';
const getUsers = require('../sqlite/getUsers');

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
  let name = user.githubRealname || user.realname;

  if (user.githubUsername) {
    name += ` (@${user.githubUsername})`;
  }

  return name;
}

module.exports = function getMessageHeader(type, userPhid, date, callback) {
  if (typeof date === 'function') {
    callback = date;
    date = null;
  }

  getUser(userPhid, user => {
    if (!user) throw new Error('User not found');
    let header = `> ${type} originally made by ${formatName(user)}`;

    if (date) {
      header += ` on ${date}`;
    }

    callback(`${header}\n\n`);
  });
};
