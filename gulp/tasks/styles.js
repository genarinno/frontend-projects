'use strict';

var config = require('../config'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	handleErrors = require('../util/handleErrors'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
    replace = require('gulp-replace');

gulp.task('styles', function() {
    gulp.src(config.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: config.styles.include,
            outputStyle: 'compressed'
        }))
        .on('error', handleErrors)
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'IE 9', 'Safari >= 7'],
            cascade: false
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(replace('..\/', '../../'))
        .pipe(replace('..\/', '../../'))
        .pipe(gulp.dest(config.styles.dest))
        .pipe(gulpif(browserSync.active, browserSync.reload({
            stream: true,
            match: '**/*.css'
        })));
});
