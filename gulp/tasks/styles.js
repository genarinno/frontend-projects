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
    debug = require("gulp-debug");

var replaceForMin = function(source, ext){
    return _replace(source, "")
    .pipe(rename({
            extname: ext
        })
    );
};

gulp.task("styles", function() {
    gulp.src(config.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: config.styles.include,
            outputStyle: "compressed"
        }))
        .on("error", handleErrors)
        .pipe(autoprefixer({
            browsers: ["last 2 versions", "IE 9", "Safari >= 7"],
            cascade: false
        }))
        .pipe(replaceForMin(".css", ".min.css"))
        .pipe(sourcemaps.write("./", {
            mapFile: function(mapFilePath) {
                 return mapFilePath.replace(".css.map", ".min.css.map");
            }
        }))
        .pipe(_replace("..\/", "../../"))
        .pipe(gulp.dest(config.styles.dest))
        .pipe(gulpif(browserSync.active, browserSync.reload({
            stream: true,
            match: "**/*.css"
        })));
});
