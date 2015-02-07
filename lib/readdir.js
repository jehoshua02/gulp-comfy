var fs = require('fs');


module.exports = function (dir) {
  return fs.readdirSync(dir).map(function (path) {
    return dir + '/' + path;
  });
};
