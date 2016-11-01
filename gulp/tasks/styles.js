"use strict";

var config = require("../config"),
	autoprefixer = require("gulp-autoprefixer"),
	browserSync = require("browser-sync"),
	gulp = require("gulp"),
	gulpif = require("gulp-if"),
	handleErrors = require("../util/handleErrors"),
	sass = require("gulp-sass"),
	sourcemaps = require("gulp-sourcemaps"),
    rename = require("gulp-rename"),
    _replace = require("gulp-replace"),
    debug = require("gulp-debug"),
    replace = require('gulp-replace'),
    clone = require('gulp-clone'),
    merge = require('merge-stream'),
    cleanCSS = require('gulp-clean-css');

var replaceForMin = function(source, ext){
    return _replace(source, "")
    .pipe(rename({
            extname: ext
        })
    );
};


var createCSS = function(styleMap){

    var source =  
     gulp.src(styleMap.src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: styleMap.include,
            errLogToConsole: true,
            outputStyle: 'expanded'
        }))
        //.pipe(replace('..\/', '../../'))
        //.pipe(sourcemaps.init())
        .on('error', handleErrors)
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'IE 9', 'Safari >= 7'],
            cascade: false
        }));

    var pipe1 = source.pipe(clone())
        .pipe(sourcemaps.write('./')) // Create sourcemap
        .pipe(replace('..\/', '../../'))
        .pipe(gulp.dest(styleMap.dest));

    var pipe2 =  source.pipe(clone())
        .pipe(replace('..\/', '../../'))
        .pipe(replaceForMin(".css", ".min.css"))
        .pipe(cleanCSS()) 
        .pipe(gulp.dest(styleMap.dest));

    return merge(pipe1, pipe2);


        /*.pipe(replace('..\/', '../../'))
        .pipe(replace('..\/', '../../'))*/
        /*.pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(styleMap.dest))
        .pipe(debug({title: 'unicorn:'}))
        .pipe(replaceForMin(".css", ".min.css"))
        .pipe(cleanCSS())
        .pipe(gulp.dest(styleMap.dest));*/
        // .pipe(gulpif(browserSync.active, browserSync.reload({
        //     stream: true,
        //     match: '**/*.css'
        // })));
};

gulp.task("styles", function() {
    createCSS(config.styles);

    config.styles_projects.forEach(function(styles_project){
        createCSS(styles_project);
    });


    // gulp.src(config.styles.src)
    //     .pipe(sourcemaps.init())
    //     .pipe(sass({
    //         includePaths: config.styles.include,
    //         outputStyle: "compressed"
    //     }))
    //     .on("error", handleErrors)
    //     .pipe(autoprefixer({
    //         browsers: ["last 2 versions", "IE 9", "Safari >= 7"],
    //         cascade: false
    //     }))
    //     .pipe(replaceForMin(".css", ".min.css"))
    //     .pipe(sourcemaps.write("./", {
    //         mapFile: function(mapFilePath) {
    //              return mapFilePath.replace(".css.map", ".min.css.map");
    //         }
    //     }))
    //     .pipe(_replace("..\/", "../../"))
    //     .pipe(gulp.dest(config.styles.dest))
    //     .pipe(gulpif(browserSync.active, browserSync.reload({
    //         stream: true,
    //         match: "**/*.css"
    //     })));

});
