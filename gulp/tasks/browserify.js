'use strict';

var browserify = require('browserify'),
    browserSync = require('browser-sync'),
    buffer = require('vinyl-buffer'),
    config = require('../config'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    handleErrors = require('../util/handleErrors'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    insert = require('gulp-insert'),
    watchify = require('watchify');


/* -------------------------------------------------------------------------
:: WATCHIFY IS WATCHING
------------------------------------------------------------------------- */

var isWatch = false;


/* -------------------------------------------------------------------------
:: EXTERNALS
------------------------------------------------------------------------- */

var externals = [].concat(config.browserify.libs);


/* -------------------------------------------------------------------------
:: FILES
------------------------------------------------------------------------- */

var files = [{
    input: config.browserify.libs,
    output: config.browserify.libName,
    destination: config.browserify.dest,
    require: true,
    debug:false
},
{
    input: config.browserify.libs,
    output: config.browserify.libName,
    destination: config.browserify.dest,
    require: true,
    debug:true
},
{
    input: config.browserify.entries,
    output: config.browserify.bundleName,
    destination: config.browserify.dest,
    debug: true
},
{
    input: config.browserify.entries,
    output: config.browserify.bundleName,
    destination: config.browserify.dest,
    debug: false
}];


/* -------------------------------------------------------------------------
:: Defer object to handle task ending.
------------------------------------------------------------------------- */
/**
 * When bundling is complete, it will execute callback so that other task 
 can wait until the task ends.*/

var Defer = function(max, callback) {
    this.max = max;
    this.count = 0;
    this.callback = callback;

    this.exec = function() {
        if (this.max === ++this.count) {
            this.callback();
        }
    };
};


/* -------------------------------------------------------------------------
:: Bundle given file.
------------------------------------------------------------------------- */

var bundle = function(bundler, options) {
    var stream = bundler.bundle(),
        createSourcemap = config.browserify.sourcemap,
        startTime = new Date().getTime(),
        outputFile = options.output,
        destination = (!options.debug) ? options.destination : options.destination + "/dev";

    return stream.on('error', handleErrors)
        .pipe(source(outputFile))
        .pipe(insert.prepend("(function($, jQuery){"))
        .pipe(insert.append("})(window.CONTIKI.$, window.CONTIKI.$);"))
        .pipe(buffer())
        .pipe(gulpif(createSourcemap && !options.debug , sourcemaps.init()))
        .pipe(gulpif(!options.debug, streamify(uglify({
            compress: {
                drop_console: false
            }
        }))))
        .pipe(gulpif(createSourcemap && !options.debug, sourcemaps.write('./')))
        .pipe(gulp.dest(destination))
        .on('end', function() {
            var time = (new Date().getTime() - startTime) / 1000;
            gutil.log('Browserified: ' + gutil.colors.cyan(options.output) + ' in ' + gutil.colors.magenta(time) + 's');
            if (isWatch) {
                browserSync.reload();
            }
    });
};


/* -------------------------------------------------------------------------
:: Create bundle properties such as if its is added or required etc.
------------------------------------------------------------------------- */

var createBundleProp = function(b, options) {
    var bundler = b;

    var externalise = function() {
        return externals.forEach(function(external) {
            bundler.external(external.expose);
        });
    };

    var i = 0;
    for (i; i < options.input.length; i++) {
        if (options.require) {
            bundler.require(options.input[i].require, {
                expose: options.input[i].expose
            });
        } else {
            bundler.add(options.input[i]);

            externalise();
        }
    }

    return bundler;
};


/* -------------------------------------------------------------------------
:: Create single bundle using files options.
------------------------------------------------------------------------- */

var createBundle = function(options) {
    var bundler = browserify({
        cache: {},
        packageCache: {},
        fullPaths: false,
        debug: false
    });

    bundler = createBundleProp(bundler, options);

    if (isWatch) {
        bundler = watchify(bundler);
        bundler.on('update', function() {
            bundle(bundler, options);

        });
    }

    return bundle(bundler, options);
};


/* -------------------------------------------------------------------------
:: Create set of bundles.
------------------------------------------------------------------------- */

var createBundles = function(bundles, defer) {
    bundles.forEach(function(bundle) {
        createBundle(bundle).on('end', function() {
            defer.exec();
        });
    });
};


/* -------------------------------------------------------------------------
:: Gulp Browserify Task
------------------------------------------------------------------------- */

gulp.task('browserify', function(done) {
    var d = new Defer(files.length, done);

    if (!global.isProd) {
        isWatch = true;
    }

    createBundles(files, d);
});
