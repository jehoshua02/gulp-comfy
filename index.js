var gulp = require('gulp');
var fs = require('fs');
var del = require('del');


module.exports = function (options) {
  var defaultOptions = {
    taskPath: '/gulp/tasks',
    taskFileExt: 'js',
    taskSeparator: '/',
    watchTaskName: 'watch',
    watchTaskPrefix: 'watch/',
    cleanTaskName: 'clean',
    cleanTaskPrefix: 'clean/'
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

  const FILE_EXT = options.taskFileExt;
  const ROOT = process.cwd() + options.taskPath;
  const SEPARATOR = options.taskSeparator;

  var queue = [ROOT];
  var watches = [];
  var cleans = [];

  while (queue.length > 0) {
    var path = queue.pop();

    if (fs.statSync(path).isDirectory()) {
      addDirectory(path);
    } else if(fs.statSync(path).isFile() && path.indexOf(FILE_EXT) == (path.length - FILE_EXT.length)) {
      addFile(path);
    }
  }

  function addFile(path) {
    var module = require(path);
    var name = path.substr(0, path.lastIndexOf('.' + FILE_EXT)).replace(ROOT + '/', '').replace('/', SEPARATOR);
    var args = [name];
    if (module.deps) { args.push(module.deps); }
    if (module.fn) { args.push(module.fn); }
    gulp.task.apply(gulp, args);

    if (module.watch) {
      var watchName = options.watchTaskPrefix + name;
      watches.push(watchName);
      (function (name, files, task) { // closure to bind variables
        gulp.task(name, [task], function () {
          console.log(name + ' (' + files + ')');
          gulp.watch(files, [task]);
        });
      })(watchName, module.watch, name);
    }

    if (module.clean) {
      var cleanName = options.cleanTaskPrefix + name;
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

    if (path !== ROOT) {
      var name = path.replace(ROOT + '/', '').replace('/', SEPARATOR);
      var deps = [];
      files.forEach(function(file) {
        if(fs.statSync(path + '/' + file).isDirectory()) {
          deps.push(name + SEPARATOR + file);
        }
        if(file.lastIndexOf('.' + FILE_EXT) !== -1) {
          deps.push(name + SEPARATOR + file.substr(0, file.lastIndexOf('.' + FILE_EXT)));
        }
      });
      gulp.task(name, deps);
    }
  }

  gulp.task(options.watchTaskName, watches);
  gulp.task(options.cleanTaskName, cleans);

  gulp.task('default', ['watch']);


  //gulp.task('comfy:watch', watches);
  //gulp.task('comfy:clean', cleans);
};
