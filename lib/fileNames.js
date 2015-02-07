var readdir = require('./readdir');
var isDir = require('./isDir');


module.exports = function (dir) {
  var files = [];
  var queue = [dir];

  while (queue.length > 0) {
    var path = queue.pop();
    if (isDir(path)) {
      Array.prototype.push.apply(queue, readdir(path));
    } else {
      files.push(path.replace(dir + '/', ''));
    }
  }

  return files;
};
