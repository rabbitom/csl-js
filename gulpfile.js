const del = require('del');
const gulp = require("gulp");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const sequence = require('run-sequence').use(gulp);

const dest = './'
const artifact = 'index.js';

gulp.task('clear', () => {
  return del([artifact]);
});

gulp.task("pack", function(){
    return gulp.src(["src/CSLUtility.js", "src/CSLMessage.js", "src/polyfill.js"])
    .pipe(babel())
    .pipe(concat(artifact))
    .pipe(gulp.dest(dest));
});

gulp.task('default', callback => {
    sequence(
        'clear',
        'pack',
        callback
    );
});