/**
  * global
  */
var gulp = require('gulp');

/**
  * sass
  */
var sass = require('gulp-sass');

/**
  * functional
  */
var browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    del = require('del'),
    cache = require('gulp-cache'),
    ssi = require('browsersync-ssi'),
    bssi = require('gulp-ssi');

// optimizetion, compress
var csso = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    imageminPngquant = require('imagemin-pngquant');


// main tasks
gulp.task('sass', function() {
    return gulp.src(['src/sass/**/*.sass', 'src/sass/**/*.scss'])
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError)) // Turning on error output
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({stream:true}))
});

gulp.task('browser-sync', function() {
    browserSync({
        server: { // Determine server parameters
            baseDir: 'src', // Directory for the server - src, link to the server - parameter 'proxy: "site_name"'
            middleware: ssi({ baseDir: 'src/', ext: '.html' })
        },
        notify: false,
        online: true
    });
});

gulp.task('include', function() {
    return gulp.src(['src/**/*.html', '!src/components/**/*', '!src/html/**/*', '!src/libs/**/*'])
        .pipe(bssi())
        .pipe(gulp.dest('src/html'))
})


// minification
gulp.task('minifyjs', function() { // .js
    return gulp.src([
        'src/js/common.js' // files
    ])
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('src/js'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('minifycss', function() { // .css
    return gulp.src('src/sass/*.sass') // files
        .pipe(sass())
        .pipe(csso())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({stream:true}))
});


// images
gulp.task('compress', async function() { // image compression
    return gulp.src('src/img/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imageminJpegRecompress({
            progressive: true,
            max: 80,
            min: 70
        }),
        imageminPngquant(),
        imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
    .pipe(gulp.dest('dist/img'))
});

gulp.task('clear', async function() { // cache clear
    return cache.clearAll()
});


// build
gulp.task('prebuild', async function() { // uploading files

    var buildCSS = gulp.src([
        'src/css/*.css',
    ])
    .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src(
        'src/fonts/**/**'
    )
    .pipe(gulp.dest('dist/fonts'));

    var buildJS = gulp.src([
        'src/js/**/*'
    ])
    .pipe(gulp.dest('dist/js'));

    var buildPHP = gulp.src(
        'src/*.php'
    )
    .pipe(gulp.dest('dist'));

    var buildBG = gulp.src(
        'src/bg/**/*'
    )
    .pipe(gulp.dest('dist/bg'));

    var buildLibs = gulp.src(
        'src/libs/**/*'
    )
    .pipe(gulp.dest('dist/libs'));

    var buildHTML = gulp.src(
        'src/html/**/*'
    )
    .pipe(gulp.dest('dist'));
});
gulp.task('clean', async function() { // build cleaner
    return del.sync('dist')
});


// watch
gulp.task('watch', function() {
    gulp.watch('src/sass/**/*.sass', gulp.parallel('css-libs'))
    gulp.watch('src/*.html').on('change', function () {
        browserSync.reload();
    });
    gulp.watch(['src/js/common.js', 'src/libs/**/*.js'], gulp.parallel('minifyjs')).on('change', function () {
        browserSync.reload();
    });
    gulp.watch('src/libs/**/*.js', gulp.parallel('minifyjs')).on('change', function () {
        browserSync.reload();
    });
    gulp.watch('src/*.php').on('change', function () {
        browserSync.reload();
    });
});


// unification
gulp.task('css-libs', gulp.series('sass', 'minifycss'));
gulp.task('build', gulp.series('css-libs', 'include', 'minifyjs', 'clean', 'compress', (gulp.parallel([
    'sass', 'prebuild'
]))));
gulp.task('default', gulp.parallel('watch', 'browser-sync', 'css-libs', 'minifyjs'));
