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
    fonter = require('gulp-fonter'),
    newer = require('gulp-newer'),
    del = require('del'),
    ssi = require('browsersync-ssi'),
    bssi = require('gulp-ssi');

function browsersync() {
    browserSync.init({
        // You can use the 'proxy' property to update the site on the server
        server: {
            baseDir: 'src/',
            middleware: ssi({ baseDir: 'src/', ext: '.html' })
        },
        notify: false,
        online: true,
        // // Open Internet access (port 3000 must be open)
        // tunnel: true
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false,
            location: false
        }
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
        'src/js/common.js'
    ])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(dest('src/js/'))
        .pipe(browserSync.stream())
}

// images minification
function images() {
    return src('src/img/src/**/*')
        .pipe(newer('src/img/dist/'))
        .pipe(imagemin())
        .pipe(dest('src/img/dist/'))
}


// css styles minification
function styles() {
    return src([
        'src/sass/styles.sass'
    ])
        .pipe(sass())
        .pipe(concat('styles.min.css'))
        .pipe(autoprefixer({ overrideBrowserslist: ['Last 10 versions'], grid: true }))
        .pipe(cleancss({level:2}))
        .pipe(dest('src/css/'))
        .pipe(browserSync.stream())
}

//fonts generator
function fonts() {
    return src('src/fonts/src/**/*')
        .pipe(fonter({
            subset: [66, 67, 68, 69, 70, 71],
            formats: ['woff', 'ttf', 'eot']
        }))
        .pipe(dest('src/fonts/dist/'))
        .pipe(browserSync.stream())
}

// deleting the dist folder
function cleandist() {
    return del('dist', { force: true })
}

// build project
function buildcopy() {
    return src([
        'src/css/**/*.min.css', 'src/js/**/*.min.js', 'src/img/dist/**/*', 'src/**/*.html', 'src/fonts/**/*'
    ], { base: 'src' })
        .pipe(dest('dist'))
}

function buildhtml() {
    return src(['src/**/*.html', '!src/parts/**/*'])
        .pipe(bssi({ root: 'src/' }))
        .pipe(dest('dist'))
}

// watch file changes
function startwatch() {
    watch('src/**/*.sass', styles)
    watch('src/img/src/**/*', images),
    watch('src/fonts/src/**/*', fonts),
    watch(['src/**/*.js', '!src/**/*.min.js'], scripts)
    watch('src/**/*.html').on('change', browserSync.reload)
}

// combinations of functions
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.build = series(cleandist, styles, scripts, images, fonts, buildcopy, buildhtml)

exports.default = parallel(scripts, styles, images, fonts, browsersync, startwatch);
