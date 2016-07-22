'use strict';
module.exports = callback => data => {
  data.toString().split('\n').forEach(msg => {
    if (msg) {
      callback(msg.trim());
    }
  });
};
