var taskModules = require('./lib/taskModules');
var defineTask = require('./lib/defineTask');
var defineWatchTask = require('./lib/defineWatchTask');


module.exports = function () {
  var modules = taskModules();
  var watchNames = [];

  for (var i = 0; i < modules.length; i++) {
    var module = modules[i];

    defineTask(module);

    if (module.watch) {
      watchNames.push(defineWatchTask(module).name);
    }
  }

  defineTask({
    name: 'watch',
    deps: watchNames,
  });
};
