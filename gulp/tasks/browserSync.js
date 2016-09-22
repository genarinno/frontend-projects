'use strict';

var config = require('../config'),
    gulp = require('gulp'),
    browserSync = require('browser-sync');

gulp.task('browserSync', function() {

    browserSync({
        port: config.browserport,
        ui: {
            port: config.uiport
        },
        proxy: {
            target: config.proxy,
            ws: true
        },
        browser: 'google chrome',
        open: false
    });

});
