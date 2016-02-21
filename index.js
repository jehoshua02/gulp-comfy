var gulp = require('gulp');
var fs = require('fs');
var del = require('del');


module.exports = function (options) {
  var defaultOptions = {
    taskPath: '/gulp/tasks',
    taskFileExt: 'js'
  };

  if (typeof options == 'object') {
    for(var o in defaultOptions) {
      if(options[o] === undefined) {
        options[o] = defaultOptions[o];
      }
    }
    options.prototype = defaultOptions;
  } else {
    options = defaultOptions;
  }

  var root = process.cwd() + options.taskPath;
  var queue = [root];
  var watches = [];
  var cleans = [];

  while (queue.length > 0) {
    var path = queue.pop();

    if (fs.statSync(path).isDirectory()) {
      addDirectory(path);
    } else if(fs.statSync(path).isFile() && path.indexOf(options.taskFileExt) == (path.length - options.taskFileExt.length)) {
      addFile(path);
    }
  }

  function addFile(path) {
    var module = require(path);
    var name = path.substr(0, path.lastIndexOf('.' + options.taskFileExt)).replace(root + '/', '');
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

  function addDirectory(path) {
    var files = fs.readdirSync(path);

    Array.prototype.push.apply(queue, files.map(function (file) {
      return path + '/' + file;
    }));

    if (path !== root) {
      var name = path.replace(root + '/', '');
      var deps = [];
      files.forEach(function(file) {
        if(fs.statSync(path + '/' + file).isDirectory()) {
          deps.push(name + '/' + file);
        }
        if(file.lastIndexOf('.' + options.taskFileExt) !== -1) {
          deps.push(name + '/' + file.substr(0, file.lastIndexOf('.' + options.taskFileExt)));
        }
      });
      gulp.task(name, deps);
    }
  }

  gulp.task('watch', watches);
  gulp.task('default', ['watch']);
  gulp.task('clean', cleans);
};
