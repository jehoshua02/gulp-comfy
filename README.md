# Gulp Comfy [![Build Status](https://travis-ci.org/jehoshua02/gulp-comfy.svg)](https://travis-ci.org/jehoshua02/gulp-comfy)

Boilerplate to make gulp as comfy as possible.


## Features

+ Task names match file paths automatically (`task1`, `task1/foo`, `task1/foo/bar`, ...).
+ Opt in to define watch tasks automatically (`watch/task1`, `watch/task2`, ...).
+ Opt in to define clean tasks automatically (`clean/task1`, `clean/task2`, ...).
+ Main `watch` and `clean` aggregate tasks defined automatically.
+ `default` task that runs `watch`.


## Install

```shell
npm install --save-dev gulp-comfy
```


## Use

One line `gulpfile.js`:

```javascript
require('gulp-comfy')();
```


### Optional Configuration

`gulpfile.js`:

```javascript
require('gulp-comfy')({
    taskPath: '/gulp/tasks',    //path to the task directory
    taskFileExt: 'js',          //file extention of task files
    taskSeparator: '/',         //seperator to concatinate sub-tasks
    cleanTaskName: 'clean',     //name of the master-clean task
    watchTaskName: 'watch',     //name of the master-watch task
    cleanTaskPrefix: 'clean/',  //prefix of discovered cleaner tasks
    watchTaskPrefix: 'watch/'   //prefix of discovered watcher tasks
});
```
__Avalible Options__

+ __`taskPath`, String, Optional__: The path of where gulp-comfy will look for Task files. `default: 'gulp/tasks'`.
+ __`taskFileExt`, String, Optional__: The file extension task files need to be included. (all other files will be ignored!) `default: 'js'`.
+ __`taskSeparator`, String, Optional__: The separator used to concatenated task names discovered in directories `default: '/'`.
+ __`cleanTaskName`, String, Optional__: The name of the main cleaner task `default: 'clean'`.
+ __`watchTaskName`, String, Optional__: The name of the main watcher task `default: 'watch'`.
+ __`cleanTaskPrefix`, String, Optional__: The prefix for discovered clean tasks. `default: 'clean/'`.
+ __`watchTaskPrefix`, String, Optional__: The prefix for discovered watch tasks. `default: 'watch/'`.

## Tasks

Define tasks in separate files under `gulp/tasks`. Instead of calling
`gulp.task()`, define the task as a module:

```javascript
module.exports = {
  // ... Task Properties ...
};
```

__Task Properties__

+ __`fn`, Function, Optional__: The function to pass to `gulp.task()`.
+ __`deps`, Array, Optional__: The array of task dependencies to pass to `gulp.task()`.
+ __`watch`, String|Array, Optional__: A glob or array of globs to pass to
`gulp.watch()`. If specified a watch task will be defined automatically for this
task with the name of the task prefixed with `watch/`.
+ __`clean`, String|Array, Optional__: A glob or array of globs to pass to
[`del()`](https://www.npmjs.com/package/del). If specified a clean task will be
defined automatically for this task with the name of the task prefixed with
`clean/`.

__Task Name__

The name of the task is determined by the file path, relative to `gulp/tasks`.
For example, if my task is defined in `gulp/tasks/build/scripts.js`, then the
name of the task would be `build/scripts`. The watch and clean, if the task
opted into them, would respectively be `watch/build/scripts` and
`clean/build/scripts`.


## Magic Tasks

In addition to per-task watch and clean tasks, there are several other "magic"
tasks defined automatically.

+ `default`: Simply runs `watch`.
+ `watch`: Aggregates individual watch tasks into one watch task.
+ `clean`: Aggregates individual clean tasks into one clean task.


## Parent Tasks

Tasks are defined automatically for any directories under `gulp/tasks` to
aggregate tasks inside the directory. For example, if the directory is named
`task1` and it contains tasks `a.js`, `b.js`, `c.js`, then the following tasks
would all be created:

+ `task1/a`
+ `task1/b`
+ `task1/c`
+ `task1` (parent task, runs all child tasks)
