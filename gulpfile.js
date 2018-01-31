var gulp = require('gulp');
var sass = require('gulp-sass');
var nano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var pkg = require('./package.json');
var yargs = require('yargs').options({
    w: {
        alias: 'watch',
        type: 'boolean'
    },
    s: {
        alias: 'server',
        type: 'boolean'
    },
    p: {
        alias: 'port',
        type: 'number'
    }
}).argv;

var option = {
    base: 'src'
};
var dist = __dirname + '/dist';

gulp.task('build:html', function() {
    gulp
      .src('./src/**/*.?(html)', option)
      .pipe(gulp.dest(dist))
      .pipe(browserSync.reload({ stream: true }));
  });

gulp.task('build:style', function () {
    return gulp.src('./src/mu.scss', option)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
        .pipe(
            nano({
                zindex: false,
                autoprefixer: false
            })
        )
        .pipe(gulp.dest(dist))
        .pipe(
            rename(function (path) {
                path.basename += '.min';
            })
        )
        .pipe(browserSync.reload({ stream: true }));
});


gulp.task('build:js', function () {
    return gulp.src('./src/mu.js', option)
        .pipe(uglify())
        .pipe(gulp.dest(dist))
})


gulp.task('release', ['build:html', 'build:style', 'build:js']);

gulp.task('watch', function () {
    gulp.watch('src/**/*.html', ['build:html']);
    gulp.watch('src/**/*.scss', ['build:style']);
    gulp.watch('src/**/*.js', ['build:js']);
    // gulp.watch('src/**/*.html', ['build:example:html']).on('change', browserSync.reload);
});


gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: '/index.html'
    });
});

// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8080
gulp.task('default', ['release'], function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});