var gulp = require('gulp');
var should = require('should');

var comfy = require('../');

describe('gulp-comfy', function () {
  process.chdir(__dirname + '/fixtures');
  comfy({
    taskPath: '/gulp_tasks',
    taskFileExt: 'jsx',
    taskSeparator: ':',
    watchTaskName: 'comfy-watch',
    watchTaskPrefix: 'watch:',
    cleanTaskName: 'comfy-clean',
    cleanTaskPrefix: 'clean:'
  });
  comfy();

  it('should load all tasks from gulp/tasks', function () {
    gulp.tasks.should.have.properties(
      'task1', 'task2', 'task3',
      'task3/a', 'task3/b', 'task3/c'
    );
  });

  describe('task', function () {
    var module = require('./fixtures/gulp/tasks/task2');
    var task = gulp.tasks['task2'];

    it('should have same deps as module', function () {
      task.dep.should.eql(module.deps);
    });

    it('should have same fn as module', function () {
      task.fn.should.eql(module.fn);
    });
  });

  it('should define parent task for directory of tasks', function () {
    gulp.tasks.should.have.property('task3');
  });

  it('should define heirarchy of tasks to match directories', function () {
    gulp.tasks.should.have.properties('task3', 'task3/foo', 'task3/foo/bar');
  });

  describe('parent task', function () {
    it('should run all children tasks', function () {
      gulp.tasks['task3'].dep.sort().should.eql([
        'task3/a', 'task3/b', 'task3/c', 'task3/foo'
      ]);
    });
    it('should run all children tasks (optional seperator)', function () {
      gulp.tasks['taskB'].dep.sort().should.eql([
        'taskB:1'
      ]);
    });
  });


  it('should define default task', function () {
    gulp.tasks.should.have.property('default');
  });

  describe('default task', function () {
    it('should run watch task', function () {
      gulp.tasks['default'].dep.should.eql(['watch']);
    });
  });

  it('should define individual watch tasks', function () {
    gulp.tasks.should.have.properties(
      'watch/task3/a', 'watch/task3/b', 'watch/task3/c'
    );
  });

  describe('individual watch tasks', function () {
    var task = gulp.tasks['watch/task3/a'];

    it('should say what is being watched and which task', function () {
      task.fn.toString().indexOf("name + ' (' + files + ')'").should.not.eql(-1);
    });
  });

  it('should define main watch task', function () {
    gulp.tasks.should.have.property('watch');
  });

  describe('main watch task', function () {
    it('should run individual watch tasks', function () {
      gulp.tasks['watch'].dep.sort().should.eql([
        'watch/task2', 'watch/task3'
      ]);
    });
  });

  it('should define individual clean tasks', function () {
    gulp.tasks.should.have.properties('clean/task1', 'clean/task2');
  });

  it('should define main clean task', function () {
    gulp.tasks.should.have.property('clean');
  });

  describe('main clean task', function () {
    it('should run individual clean tasks', function () {
      gulp.tasks['clean'].dep.sort().should.eql(['clean/task1', 'clean/task2']);
    });
  });

  it('should define only expected tasks', function () {
    var tasks = [];
    for (var task in gulp.tasks) {
      tasks.push(task);
    }
    tasks.sort().should.eql([
      'clean', 'clean/task1', 'clean/task2','clean:taskA',
      'comfy-clean', 'comfy-watch',
      'default',
      'task1', 'task2', 'task3',
      'task3/a', 'task3/b', 'task3/c', 'task3/foo', 'task3/foo/bar',
      'taskA', 'taskB', 'taskB:1', 'taskC_multi', 'taskC_multi:0', 'taskC_multi:1', 'taskC_multi:named',
      'watch', 'watch/task2', 'watch/task3','watch/task3/a', 'watch/task3/b', 'watch/task3/c', 'watch:taskA'
    ]);
  });

  describe('special gulp-comfy configuration', function() {

    it('should load all tasks from a defined {taskPath:directory}', function () {
      gulp.tasks.should.have.properties(
          'taskA'
      );
    });
    it('should only load tasks with the extension {taskFileExt:string}', function() {
      gulp.tasks.should.not.have.properties(
          'taskA_fake'
      );
    });
    it('should concatinate subtasks with {taskSeparator:string}', function() {
      gulp.tasks.should.have.properties(
          'taskB:1'
      );
    });
    it('should use the right prefix for cleaners', function() {
      gulp.tasks.should.have.properties(
          'clean:taskA', 'clean/task1'
      );
    });
    it('should use the right prefix for watchers', function() {
      gulp.tasks.should.have.properties(
          'watch:taskA', 'watch/task3/a'
      );
    });
    it('should create a watcher task with the name of {watchTaskName}', function() {
      gulp.tasks.should.have.properties(
          'comfy-watch'
      );
    });
    it('should create a cleaner task with the name of {cleanTaskName}', function() {
      gulp.tasks.should.have.properties(
          'comfy-clean'
      );
    });
  });

  describe('advanced gulp-comfy features', function() {
    process.chdir(__dirname + '/fixtures');

    it('should register master tasks in task-files that return an array', function () {
      gulp.tasks.should.have.properties(
        'taskC_multi'
      );
    });

    it('should multiply tasks in task-files that return an array', function () {
      gulp.tasks.should.have.properties(
        'taskC_multi:0','taskC_multi:1'
      );
    });
    it('should multiply tasks in task-files and name them if a name is provided', function () {
      gulp.tasks.should.have.properties(
        'taskC_multi:named'
      );
    });

  });
});
