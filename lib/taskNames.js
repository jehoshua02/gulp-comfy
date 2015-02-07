var fileNames = require('./fileNames');


module.exports = function (dir) {
  return fileNames(dir).map(function (file) {
    return file.replace(/(\/index|)\.js$/, '');
  });
};
