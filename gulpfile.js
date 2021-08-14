const { src, dest, parallel, series, watch } = require('gulp');

/**
  * Connected modules
  */
const browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify-es').default,
    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    newer = require('gulp-newer'),
    del = require('del'),
    ssi = require('browsersync-ssi'),
    bssi = require('gulp-ssi');

function browsersync() {
    browserSync.init({
        // You can use the 'proxy' property to update the site on the server
        server: {
            baseDir: 'app/',
            middleware: ssi({ baseDir: 'app/', ext: '.html' })
        },
        notify: false,
        online: true,
        // // Open Internet access (port 3000 must be open)
        // tunnel: true
    })
}


/**
  * tasks that are performed to build
  */

// script minification
function scripts() {
    return src([
        // module paths
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/common.js'
    ])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js/'))
        .pipe(browserSync.stream())
}

// images minification
function images() {
    return src('app/img/src/**/*')
        .pipe(newer('app/img/dist/'))
        .pipe(imagemin())
        .pipe(dest('app/img/dist/'))
}


// css styles minification
function styles() {
    return src([
        'app/sass/styles.sass'
    ])
        .pipe(sass())
        .pipe(concat('styles.min.css'))
        .pipe(autoprefixer({ overrideBrowserslist: ['Last 10 versions'], grid: true }))
        .pipe(cleancss(({ level: { 1: { specialComments: 0 } } })))
        .pipe(dest('app/css/'))
        .pipe(browserSync.stream())
}

// deleting the dist folder
function cleandist() {
    return del('dist', { force: true })
}

// build project
function buildcopy() {
    return src([
        'app/css/**/*.min.css', 'app/js/**/*.min.js', 'app/img/dist/**/*', 'app/**/*.html', 'app/fonts/**/*'
    ], { base: 'app' })
        .pipe(dest('dist'))
}

function buildhtml() {
    return src(['app/**/*.html', '!app/parts/**/*'])
        .pipe(bssi({ root: 'app/' }))
        .pipe(dest('dist'))
}

// watch file changes
function startwatch() {
    watch('app/**/*.sass', styles)
    watch('app/img/src/**/*', images)
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts)
    watch('app/**/*.html').on('change', browserSync.reload)
}

// combinations of functions
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.build = series(cleandist, styles, scripts, images, buildcopy, buildhtml)

exports.default = parallel(scripts, styles, images, browsersync, startwatch);
