import pkg from 'gulp';
const { src, dest, parallel, series, watch } = pkg;

import { init, stream, reload } from 'browser-sync'
import concat from 'gulp-concat'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)
import autoprefixer from 'gulp-autoprefixer'
import imagemin from 'gulp-imagemin'
import changed from 'gulp-changed'
import del from 'del'
import bssi from 'browsersync-ssi'
import ssi from 'ssi'
// import webpack from 'webpack'
// import webpackStream from 'webpack-stream'

function browsersync() {
  init({
    // You can use the 'proxy' property to update the site on the server
    server: {
      baseDir: 'src/',
      middleware: bssi({ baseDir: 'src/', ext: '.html' })
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
  return src(['src/assets/js/*.js'])
    // .pipe(webpackStream({
    //   mode: 'production',
    //   performance: { hints: false },
    //   plugins: [
    //     new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', 'window.jQuery': 'jquery' })
    //   ],
    //   module: {
    //     rules: [
    //       {
    //         exclude: /(node_modules)/,
    //         use: {
    //           loader: 'babel-loader',
    //           options: {
    //             presets: ['@babel/preset-env']
    //           }
    //         }
    //       }
    //     ]
    //   }
    // }, webpack))
    // .pipe(concat('scripts.min.js'))
    // .pipe(dest('src/js/'))
    .pipe(stream())
}

function images() {
  return src('src/assets/img/src/**/*')
    .pipe(changed('src/assets/img/dist'))
    .pipe(imagemin())
    .pipe(dest('src/assets/img/dist'))
}

function styles() {
  return src([
    'src/assets/sass/**/*.scss'
  ])
    .pipe(sass.sync())
    .pipe(concat('style.css'))
    .pipe(autoprefixer())
    .pipe(dest('src'))
    .pipe(stream())
}

function buildhtml() {
  let includes = new ssi('src', 'dist', '/**/*.html')
  includes.compile()
  return del('dist/parts')
}

async function cleandist() {
  del('dist/**/*', { force: true })
}

function buildcopy() {
  return src([
    'src/*.css', 'src/assets/js/**/*.js', 'src/assets/img/dist/**/*', 'src/**/*.html', 'src/assets/fonts/**/*', 'src/assets/libs/**/*'
  ], { base: 'src' })
    .pipe(dest('dist'))
}

function startwatch() {
  watch('src/assets/sass/**/*.scss', styles)
  watch('src/assets/img/src/**/*', images)
  watch('src/assets/js/*.js', scripts)
  watch('src/**/*.html').on('change', reload)
}

export { scripts, styles, images }

export const build = series(cleandist, parallel(styles, scripts, images), buildcopy, buildhtml)

export default parallel(scripts, styles, images, browsersync, startwatch)
