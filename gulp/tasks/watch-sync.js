'use strict';

var config = require('../config'),
    gulp = require('gulp'),
    browserSync = require('browser-sync');

gulp.task('watch-sync', ['browserSync'], function() {

    // JavaScript Lint/Hint
    // gulp.watch(config.scripts.src, ['lint']);

    // Sass
    gulp.watch(config.styles.src, ['styles']);
});
