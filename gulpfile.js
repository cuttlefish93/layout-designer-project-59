const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const pug = require('gulp-pug');
const svgSprite = require('gulp-svg-sprite');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const removeComments = require('gulp-strip-css-comments');
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const del = require('del');
const rigger = require('gulp-rigger');
const notify = require('gulp-notify');

/* Paths */
const srcPath = 'app/';
const buildPath = 'build/';

const path = {
  build: {
    html: buildPath,
    css: `${buildPath}/css/`,
    js: `${buildPath}/js/`,
    images: `${buildPath}/images/`,
    fonts: `${buildPath}/fonts/`
  },
  src: {
    html: `${srcPath}/*.pug`,
    css: `${srcPath}/scss/**/*.scss`,
    js: `${srcPath}/js/**/*.js`,
    images: `${srcPath}/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}`,
    fonts: `${srcPath}/fonts/**/*.{eot,woff,woff2,ttf,svg}`
  },
  watch: {
    html: `${srcPath}/*.pug`,
    css: `${srcPath}/scss/**/*.scss`,
    js: `${srcPath}/js/**/*.js`,
    images: `${srcPath}/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}`,
    fonts: `${srcPath}/fonts/**/*.{eot,woff,woff2,ttf,svg}`
  },
  clean: `./${buildPath}`
}

const server = () => {
  browserSync.init({
    server: {
      baseDir: `./${buildPath}`
    }
  });
}

const html = () => {
  return src(path.src.html, { base: srcPath })
    .pipe(plumber())
    .pipe(pug())
    .pipe(dest(path.build.html))
    .pipe(browserSync.reload({ stream: true }));
}

const css = () => {
  return src(path.src.css)
    .pipe(plumber({
      errorHandler: function (err) {
        notify.onError({
          title: 'SCSS Error',
          message: 'Error: <%= error.message %>'
        })(err);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(concat('styles.css'))
    .pipe(dest(path.build.css))
    .pipe(cssnano({
      zindex: false,
      discardComments: {
        removeAll: true
      }
    }))
    .pipe(removeComments())
    .pipe(rename({
      suffix: '.min',
      extname: '.css'
    }))
    .pipe(concat('styles.min.css'))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({ stream: true }));
}

const js = () => {
  return src(path.src.js, { base: `${srcPath}js/` })
    .pipe(plumber({
      errorHandler: function (err) {
        notify.onError({
          title: 'JS Error',
          message: 'Error: <%= error.message %>'
        })(err);
        this.emit('end');
      }
    }))
    .pipe(rigger())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min',
      extname: '.js'
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({ stream: true }));
}

const images = () => {
  return src(path.src.images, { base: `${srcPath}images/` })
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 80, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({ stream: true }));
}

const fonts = () => {
  return src(path.src.fonts, { base: `${srcPath}fonts/` })
    .pipe(browserSync.reload({ stream: true }));
}

const watchFiles = () => {
  watch([path.watch.html], html);
  watch([path.watch.css], css);
  watch([path.watch.js], js);
  watch([path.watch.images], images);
  watch([path.watch.fonts], fonts);
}

const clean = () => {
  return del(path.clean);
}

const build = series(clean, parallel(html, css, js, images, fonts));
const watching = parallel(build, watchFiles, server);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watching;
exports.default = watching;

































