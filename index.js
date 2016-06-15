var gulp = require('gulp');
var fs = require('fs');
var del = require('del');
var watch = require('gulp-watch');

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
  
  walkDirectory(null, ROOT);
  
  function walkDirectory(parent,path) {
    var node = {
      name: path.replace(ROOT + '/', '').replace('/', SEPARATOR),
      childTasks: [],
      watches: [],
      cleans:[]
    };
    
    fs.readdirSync(path).forEach(function(file) {
      var filepath = path + '/' + file;
      
      if(fs.statSync(filepath).isFile() && filepath.lastIndexOf(FILE_EXT) == (filepath.length - FILE_EXT.length)) {
        registerFile(node, filepath);
      } else if (fs.statSync(filepath).isDirectory()) {
        walkDirectory(node,filepath)
      }
    });
    
    registerNode(node, parent);
  }
  
  function registerNode(node, parent) {
    if(parent) {
      if(node.childTasks.length > 0) {
        gulp.task.apply(gulp, [node.name, node.childTasks]);
        parent.childTasks.push(node.name);
      }
      if(node.watches.length > 0) {
        gulp.task.apply(gulp, [options.watchTaskPrefix + node.name, node.watches]);
        parent.watches.push(options.watchTaskPrefix + node.name);
      }
      if(node.cleans.length > 0) {
        gulp.task.apply(gulp, [options.cleanTaskPrefix + node.name, node.cleans]);
        parent.cleans.push(options.cleanTaskPrefix + node.name);
      }
      
    } else {
      if(node.watches.length > 0) {
        gulp.task.apply(gulp, [options.watchTaskName, node.watches]);
      }
      if(node.cleans.length > 0) {
        gulp.task.apply(gulp, [options.cleanTaskName, node.cleans]);
      }
    }
  }
  
  function registerFile(node, path) {
    var module = require(path);
    var name = path.substr(0, path.lastIndexOf('.' + FILE_EXT)).replace(ROOT + '/', '').replace(/[/]/g, SEPARATOR);
    
    if(module instanceof Array) {
      registerTaskArray(module, node, name)
    } else {
      createTask(module, node, name);
    }
  }
  
  function registerTaskArray(tasks, parent, name) {
    var node = {
      name: name,
      childTasks: [],
      watches: [],
      cleans:[]
    };
    tasks.forEach(function(task, i) {
      if(task.name) {
        createTask(task, node, name + SEPARATOR + task.name);
      } else {
        createTask(task, node, name + SEPARATOR + i);
      }
    });
    registerNode(node, parent);
  }
  
  
  function createTask(module, node, name) {
    var args = [name];
    
    if (module.deps) {
      args.push(module.deps);
    }
    
    if (module.fn) { args.push(module.fn); }
    gulp.task.apply(gulp, args);
    
    node.childTasks.push(name);
    
    if (module.watch) {
      var watchName = options.watchTaskPrefix + name;
      node.watches.push(watchName);
      // closure to bind variables
      (function (watchName, files, taskName, events) { 
        gulp.task(watchName, [taskName], function () {
          events = events || ['add', 'change', 'unlink'];
          console.log(watchName + '('+ files +')', events);
          watch(files, {events: events}, function() {
            gulp.start(taskName);
          });
        });
      })(watchName, module.watch, name, module.watchEvents);
    }
    
    if (module.clean) {
      var cleanName = options.cleanTaskPrefix + name;
      node.cleans.push(cleanName);
      (function (name, files) { // closure to bind variables
        gulp.task(name, function (done) {
          return del(files, function () { done(); });
        });
      })(cleanName, module.clean);
    }
  }
  
  
  
  gulp.task('default', [options.watchTaskName]);
};
