var fs = require('fs');


module.exports = function (path) {
  return fs.statSync(path).isDirectory();
};
