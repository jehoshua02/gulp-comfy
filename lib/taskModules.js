var taskNames = require('./taskNames');


module.exports = function (path) {
  var path = process.cwd() + '/gulp/tasks';
  return taskNames(path).map(function (name) {
    var module = require(path + '/' + name);
    module.name = name;
    return module;
  });
};
