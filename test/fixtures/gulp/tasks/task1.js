var gulp = require('gulp');


module.exports = {
  deps: ['clean/task1'],
  fn: function () {
    return gulp.src('./src/task1.html')
      .pipe(gulp.dest('./dest/task1'));
  },
  clean: './dest/task1'
};
