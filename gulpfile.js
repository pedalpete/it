var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');

var jsFiles = ['./*.js', './**/*.js'];

gulp.task('jshint', function() {
	gulp.src('./index.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('jscs', function() {
	return gulp.src(jsFiles)
		.pipe(jscs());
});