var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');  
var rename = require('gulp-rename');  
var uglify = require('gulp-uglify');  
var exec = require('child_process').exec;

var autoprefixerOptions = {
  browsers: ['> 0%']
};

gulp.task('styles', function() {
    gulp.src('scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(gulp.dest('css/'));
});

gulp.task('watch',function() {
    gulp.watch(['scss/**/*.scss', 'scss/**/*.css'],['styles']);
    // gulp.watch('www/js/**/*.js',['scripts']);
});