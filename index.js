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
        watches.push(watchName);
        (function (name, files, task) { // closure to bind variables
          gulp.task(name, [task], function () {
            console.log(name + ' (' + files + ')');
            gulp.watch(files, [task]);
          });
        })(watchName, module.watch, name);
      }

      if (module.clean) {
        var cleanName = 'clean/' + name;
        cleans.push(cleanName);
        (function (name, files) { // closure to bind variables
          gulp.task(name, function (done) {
            del(files, function () { done(); });
          });
        })(cleanName, module.clean);
      }
    }
  }

  gulp.task('watch', watches);
  gulp.task('default', ['watch']);
  gulp.task('clean', cleans);
};
