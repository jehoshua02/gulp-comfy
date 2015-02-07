var gulp = require('gulp');


module.exports = function (module) {
  var args = [];
  args.push(module.name);

  if (module.deps) {
    args.push(module.deps);
  }

  if (module.fn) {
    args.push(module.fn);
  }

  gulp.task.apply(gulp, args);
};
