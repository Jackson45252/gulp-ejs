'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');

var dir = {
    src : '_src',
    dev : 'dev',
    dist : 'dist',
    assets : 'assets',
    projectRoot : ''
};

// server
gulp.task('server', function () {
    browserSync({
        server: {
            baseDir: dir.dev
        },
        ghostMode: false
    });
});

// watch
gulp.task('watch', function () {
    gulp.watch([path.join(dir.src, '**/*.html')], ['html']);
    gulp.watch([path.join(dir.src, dir.projectRoot, '**/*.ejs')], ['ejs']);
    gulp.watch([path.join(dir.src, dir.projectRoot, dir.assets, 'sass/*.scss')], ['sass']);
    gulp.watch([path.join(dir.src, dir.projectRoot, dir.assets, 'js/plugins/*')], ['concat']);
    gulp.watch([path.join(dir.src, dir.projectRoot, dir.assets, 'js/*.js')], ['jshint', 'copy:js']);
});

// sass
gulp.task('sass', function () {
    return gulp.src(path.join(dir.src, dir.projectRoot, dir.assets, 'sass/*.scss'))
        .pipe($.plumber({
            errorHandler: $.notify.onError('Error: <%= error.message %>')
        }))
        .pipe($.sass())
        .pipe($.autoprefixer({browsers: ['last 3 version', 'ie 9']}))
        .pipe(gulp.dest(path.join(dir.dev, dir.projectRoot, dir.assets, 'css')))
        .pipe(browserSync.reload({stream:true}));
});

// jshint
gulp.task('jshint', function () {
    return gulp.src(path.join(dir.src, dir.projectRoot, dir.assets, 'js/*.js'))
        .pipe($.jshint())
        .pipe($.notify(function (file) {
            if (file.jshint.success) {
                return false;
            }
            var errors = file.jshint.results.map(function (data) {
                if (data.error) {
                    return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
                }
            }).join("\n");
            return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
        }))
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest(path.join(dir.src, dir.projectRoot, dir.assets, 'js')))
        .pipe(browserSync.reload({stream:true}));
});

// ejs
gulp.task('ejs', function() {
    return gulp.src([path.join(dir.src, '**/*.html'), '!' + path.join(dir.src, '**/_*.ejs')])
        .pipe($.ejs())
        .pipe($.plumber({
            errorHandler: $.notify.onError( 'Error: <%= error.message %>' )
        }))
        .pipe(gulp.dest(path.join(dir.dev)))
        .pipe(browserSync.reload({stream:true}));
});

// htmlhint
gulp.task('html', function () {
    return gulp.src(path.join(dir.dev, '**/*.html'))
        .pipe($.plumber({
            errorHandler: $.notify.onError('Error: <%= error.message %>')
        }))
        .pipe($.htmlhint())
        .pipe($.htmlhint.failReporter())
        .pipe(browserSync.reload({stream:true}));
});

// images
gulp.task('images', function () {
    return gulp.src(path.join(dir.src, dir.projectRoot, dir.assets, 'images/**/*'))
        .pipe($.imagemin())
        .pipe(gulp.dest(path.join(dir.src, dir.projectRoot, dir.assets, 'images')))
        .pipe(gulp.dest(path.join(dir.dev, dir.projectRoot, dir.assets, 'images')))
        .pipe(browserSync.reload({stream:true}));
});

// js plugins
gulp.task('concat', function () {
    return gulp.src([path.join(dir.src, dir.projectRoot, dir.assets, 'js/plugins/*.js')])
        .pipe($.concat('plugins.js'))
        .pipe(gulp.dest(path.join(dir.dev, dir.projectRoot, dir.assets, 'js/lib')));
});

// uglify
gulp.task('uglify', function () {
    return gulp.src(path.join(dir.dev, dir.projectRoot, dir.assets, 'js/*.js'))
        .pipe($.uglify({preserveComments: 'some'}))
        .pipe(gulp.dest(path.join(dir.dist, dir.projectRoot, dir.assets, 'js')));
});

// css-minify
gulp.task('cssmin', function () {
    return gulp.src(path.join(dir.dev, dir.projectRoot, dir.assets, 'css/*.css'))
        .pipe($.minifyCss({compatibility: 'ie9'}))
        .pipe(gulp.dest(path.join(dir.dist, dir.projectRoot, dir.assets, 'css')));
});

// clean
gulp.task('clean:all', function () {
    return del([dir.dist]);
});

//copy
gulp.task('copy:js', function () {
    return gulp.src([path.join(dir.src, '**/*.js'), '!' + path.join(dir.src, dir.projectRoot, dir.assets, 'js/plugins/*.js')])
        .pipe(gulp.dest(dir.dev));
});
gulp.task('copy:dev', function () {
    return gulp.src(path.join(dir.dev, '**/*'))
        .pipe(gulp.dest(dir.dist));
});

gulp.task('default', function () {
    return runSequence(
        ['sass', 'ejs', 'images', 'concat', 'copy:js'],
        ['server', 'watch']
    );
});

gulp.task('build', function () {
    return runSequence(
        'clean:all',
        ['sass', 'ejs', 'images', 'concat'],
        'copy:dev',
        'uglify',
        'cssmin'
    );
});

