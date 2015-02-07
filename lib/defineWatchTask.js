var gulp = require('gulp');
var defineTask = require('./defineTask');


module.exports = function (module) {
  var watchModule = {
    deps: [module.name],
    name: 'watch/' + module.name,
    fn: function () {
      console.log('watch: ' + module.watch + ', tasks: ' + module.name);
      gulp.watch(module.watch, [module.name]);
    }
  };

  defineTask(watchModule);

  return watchModule;
};
