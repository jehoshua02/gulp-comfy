var gulp = require('gulp');
var fs = require('fs');
var del = require('del');


module.exports = function () {
  var root = process.cwd() + '/gulp/tasks';
  var queue = [root];
  var watches = [];
  var cleans = [];

  while (queue.length > 0) {
    var path = queue.pop();

    if (fs.statSync(path).isDirectory()) {
      var files = fs.readdirSync(path);
      Array.prototype.push.apply(queue, files.map(function (file) {
        return path + '/' + file;
      }));

      if (path !== root) {
        var name = path.replace(root + '/', '');
        var deps = files.map(function (file) {
          return name + '/' + file.replace(/\.js$/, '');
        });
        gulp.task(name, deps);
      }
    } else {
      var module = require(path);
      var name = path.replace(root + '/', '').replace(/\.js$/, '');
      var args = [name];
      if (module.deps) { args.push(module.deps); }
      if (module.fn) { args.push(module.fn); }
      gulp.task.apply(gulp, args);

      if (module.watch) {
        var watchName = 'watch/' + name;
        gulp.task(watchName, [name], function () {
          console.log('watch: ' + module.watch + ', task: ' + name);
          gulp.watch(module.watch, [name]);
        });
        watches.push(watchName);
      }

      if (module.clean) {
        var cleanName = 'clean/' + name;
        cleans.push(cleanName);
        gulp.task(cleanName, function (done) {
          del(module.clean, function () {
            done();
          });
        });
      }
    }
  }

  gulp.task('watch', watches);
  gulp.task('default', ['watch']);
  gulp.task('clean', cleans);
};
