import pkg from 'gulp';
const { src, dest, parallel, series, watch } = pkg;

import { init, stream, reload } from 'browser-sync'
import concat from 'gulp-concat'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)
import autoprefixer from 'gulp-autoprefixer'
import imagemin from 'gulp-imagemin'
import imageminSvgo from 'imagemin-svgo'
import fonter from 'gulp-fonter'
import changed from 'gulp-changed'
import del from 'del'
import ssi from 'browsersync-ssi'
import bssi from 'gulp-ssi'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'

function browsersync() {
    init({
        // You can use the 'proxy' property to update the site on the server
        server: {
            baseDir: 'src/',
            middleware: ssi({ baseDir: 'src/', ext: '.html' })
        },
        notify: false,
        online: true,
        // tunnel: true
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false,
            location: false
        }
    })
}

function scripts() {
    return src(['src/js/common.js', '!src/js/*.min.js'])
        .pipe(webpackStream({
            mode: 'production',
            performance: { hints: false },
            plugins: [
                new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', 'window.jQuery': 'jquery' })
            ],
            module: {
                rules: [
                    {
                        exclude: /(node_modules)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
            }
        }, webpack)).on('error', function handleError() {
            this.emit('end')
        })
        .pipe(concat('scripts.min.js'))
        .pipe(dest('src/js/'))
        .pipe(stream())
}

function images() {
    return src('src/img/src/**/*')
        .pipe(changed('src/img/dist/'))
        .pipe(imagemin({
            plugins: [
                imageminSvgo({
                    plugins: [{
                        name: 'removeViewBox',
                        active: false
                    }]
                })
            ]
        }))
        .pipe(dest('src/img/dist/'))
}

function styles() {
    return src([
        'src/sass/styles.scss'
    ])
        .pipe(sass.sync({ outputStyle: 'compressed' }))
        .pipe(concat('styles.min.css'))
        .pipe(autoprefixer())
        .pipe(dest('src/css/'))
        .pipe(stream())
}

function fonts() {
    return src('src/fonts/src/**/*')
        .pipe(fonter({
            subset: [66, 67, 68, 69, 70, 71],
            formats: ['woff', 'ttf', 'eot']
        }))
        .pipe(dest('src/fonts/dist/'))
        .pipe(stream())
}

function cleandist() {
    return del('dist', { force: true })
}

function buildcopy() {
    return src([
        'src/css/**/*.min.css', 'src/js/**/*.min.js', 'src/img/dist/**/*', 'src/**/*.html', 'src/fonts/**/*'
    ], { base: 'src' })
        .pipe(dest('dist'))
}

function deploy() {
    return src('dist/**/*')
        .pipe(dest('../../builds/aigen31.github.io/project_name'))
}

function buildhtml() {
    return src(['src/**/*.html'])
        .pipe(bssi({ root: 'src/' }))
        .pipe(dest('dist'))
}

function startwatch() {
    watch('src/sass/**/*.scss', styles)
    watch('src/img/src/**/*', images),
    watch('src/fonts/src/**/*', fonts),
    watch(['src/js/common.js', '!src/**/*.min.js'], scripts)
    watch('src/**/*.html').on('change', reload)
}

export { scripts, styles, images, fonts, deploy }

export const build = series(cleandist, styles, scripts, images, fonts, buildcopy, buildhtml, deploy)

export default parallel(scripts, styles, images, fonts, browsersync, startwatch)
