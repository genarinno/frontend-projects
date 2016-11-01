'use strict';

var config = require('../config'),
    gulp = require('gulp');//
    //browserSync = require('browser-sync'); //Disabled Browser SYNC by cache problem

//gulp.task('watch', ['browserSync'], function() { //Disabled Browser SYNC by cache problem
gulp.task('watch', [], function() {

    // Scripts are automatically watched and rebundled by Watchify inside Browserify task
    
    // JavaScript Lint/Hint
    //gulp.watch(config.scripts.src, ['lint']);

    // Sass
    gulp.watch(config.watch, ['styles']);

    // Views
    //gulp.watch(config.views.src, browserSync.reload);

});
