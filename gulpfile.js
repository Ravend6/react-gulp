var 
  gulp = require('gulp'),
  util = require('gulp-util'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  watch = require('gulp-watch'),
  server = require('gulp-server-livereload'),
  gulpif = require('gulp-if'),
  minifyHTML = require('gulp-minify-html'),
  minifyCss = require('gulp-minify-css'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  rename = require("gulp-rename"),
  source = require('vinyl-source-stream'),
  browserify = require('browserify'),
  streamify = require('gulp-streamify'),
  newer = require('gulp-newer'),
  autoprefixer = require('autoprefixer-stylus'),
  reactify = require('reactify'),
  stylus = require('gulp-stylus');

// Config
var 
  isMinify = false,
  srcDir = './src/',
  distdDir = './dist/';

// Files
var 
  stylusFiles = {
    src: [srcDir + 'stylus/*.styl', srcDir + 'stylus/**/*.styl'],
    dist: distdDir + 'css/'
  },
  jsFiles = {
    src: [srcDir + 'js/*.{js,jsx,json}', srcDir + 'js/**/*.{js,jsx,json}'],
    dist: distdDir + 'js/'
  },
  htmlFiles = {
    src: srcDir + '*.html',
    dist: distdDir
  },
  imgFiles = {
    src: [srcDir + 'img/*.*', srcDir + 'img/**/*.*'],
    dist: distdDir + 'img/'
  };

// Test log
gulp.task('log', function () {
  util.log('Util work!');
});

gulp.task('stylus', function () {
  gulp.src(stylusFiles.src)
    .pipe(stylus({
      compress: isMinify,
      use: [autoprefixer({ browsers: ["> 0%"] })]
    }))
    .pipe(concat('bundle.css'))
    .pipe(gulpif(isMinify, minifyCss()))
    .pipe(gulp.dest(stylusFiles.dist));
});

gulp.task('js', function () {
  var bundleStream = browserify('./src/js/main.jsx').transform(reactify).bundle();
  
    bundleStream
      .pipe(source('main.js'))
      .pipe(gulpif(isMinify, streamify(uglify())))
      .pipe(rename('bundle.js'))
      .pipe(gulp.dest(jsFiles.dist));

  // Настройки без browserify
  // gulp.src(jsSrc)
  //   .pipe(concat('app.js'))
  //   .pipe(rename('app.js'))
  //   .pipe())
  //   .pipe(gulp.dest('./dist/js/'));
});

gulp.task('html', function () {
  gulp.src(htmlFiles.src)
    .pipe(gulpif(isMinify, minifyHTML({
      conditionals: true,
      spare:true
    })))
    .pipe(gulp.dest(htmlFiles.dist));
});

gulp.task('img', function () {
  gulp.src(imgFiles.src)
    .pipe(newer(imgFiles.dist))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(imgFiles.dist));
});

gulp.task('watch', function () {
  gulp.watch(stylusFiles.src, ['stylus']);
  gulp.watch(jsFiles.src, ['js']);
  gulp.watch(htmlFiles.src, ['html']);
  gulp.watch(imgFiles.src, ['img']);
});

gulp.task('webserver', function() {
  gulp.src(distdDir)
    .pipe(server({
      livereload: true,
      directoryListing: false,
      open: false,
      defaultFile: 'index.html'
    }));
});


gulp.task('default', ['html', 'stylus', 'js', 'img', 'watch', 'webserver']);