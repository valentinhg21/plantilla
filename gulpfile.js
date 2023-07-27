const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'))
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const stripCssComments = require('gulp-strip-css-comments')
const browserSync = require('browser-sync')
const replace = require('gulp-string-replace')
const imagemin = require('gulp-imagemin')
const copydir = require('copy-dir')
const mode = require('gulp-mode')()

const webp = require('gulp-webp');


// Create browserSync server
var server = browserSync.create();

// Set paths for dest and source files
var paths = {
    dest: './dist',

    styles: {
        src: './assets/sass/**/*.scss',
        sourcemaps: './dist/css/sourcemap.css'
    },

    scripts: {
        src: [
            './assets/js/utils/*.js',
            './assets/js/index.js'
        ]
    },

    images: {
        src: [
            './assets/img/**/*.jpg',
            './assets/img/**/*.jpeg',
            './assets/img/**/*.png',
            './assets/img/**/*.svg',
            './assets/img/**/*.gif',
            './assets/img/**/*.webp'
        ],

        dest: './dist/img'
    },

    fav: {
        src:[
            './assets/fav/**/*.jpg',
            './assets/fav/**/*.jpeg',
            './assets/fav/**/*.png',
            './assets/fav/**/*.svg',
            './assets/fav/**/*.gif',
            './assets/fav/**/*.webp',
            './assets/fav/**/*.ico'
        ],
        dest: './dist/fav'
    },

    fonts: {
        src: [
            './assets/webfonts/*.ttf',
            './assets/webfonts/*.woff',
            './assets/webfonts/*.woff2',
            './assets/webfonts/*.eot',
            './assets/webfonts/*.svg'
        ],

        dest: './dist/webfonts'
    }
};

// Options
var sassOptions = {
    errLogToConsole: true,
    /*
    Output options:
    - compressed
    - compact
    - nested
    - expanded
    */
    outputStyle: 'compressed'
};

// Uglify and concat JS files
function scripts() {
    return gulp
        .src(paths.scripts.src[1])
        .pipe(uglify())
        .pipe(concat('theme.min.js'))
        .pipe(mode.development(sourcemaps.write('../sourcemaps')))
        .pipe(gulp.dest(paths.dest + "/js"))
        .pipe(server.stream());
}

function utilsScript() {
    return gulp
        .src(paths.scripts.src[0])
        .pipe(mode.development(sourcemaps.write('../sourcemaps')))
        .pipe(gulp.dest(paths.dest + "/js/utils"))
        .pipe(server.stream());
}

// Bundle styles files
function styles() {
    // Bundle everything
    return gulp
        .src(paths.styles.src)
        .pipe(mode.development(sourcemaps.init()))
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(stripCssComments({
            preserve: false
        }))
        .pipe(mode.development(sourcemaps.write('../sourcemaps')))
        .pipe(gulp.dest(paths.dest + "/css"))
        .pipe(server.stream());
}

// Reload when required
function reload(done) {
    server.reload();
    done();
}

// Serve the app using browserSync
function serve(done) {
    server.init({
        proxy: "",
        port: 8888
    });

    done();
}



function images_compression(done) {
    return gulp
        .src(paths.images.src)
        .pipe(imagemin([
            imagemin.mozjpeg({
                quality: 60,
                progressive: true
            }),
            
        ]))
        .pipe(gulp.dest(paths.images.dest))
}

function convertWebp(done){
    return gulp
        .src(paths.images.src)
        .pipe(webp({ quality: 40}))
        .pipe(gulp.dest(paths.images.dest))
}

function copy_fonts() {
    return gulp
        .src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest))
}
function copy_fav() {
    return gulp
        .src(paths.fav.src)
        .pipe(gulp.dest(paths.fav.dest))
}
// Watch and reload on changes
function watch() {
    gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
    gulp.watch(paths.scripts.src, gulp.series(utilsScript, reload));
    gulp.watch(paths.styles.src, gulp.series(styles, reload));
    gulp.watch(paths.images.src, gulp.series(convertWebp, reload));
    gulp.watch(paths.images.src, gulp.series(images_compression, reload));


};
// Compress images
gulp.task('compress-images', gulp.series(
    images_compression
));
gulp.task('compress-webp', gulp.series(
    convertWebp
));

gulp.task('copyfonts', function () {
    copy_fonts
});

gulp.task('copyfav', function () {
    copy_fav
});

// Build for prod
gulp.task('build', gulp.series(
    styles, utilsScript, scripts,images_compression, convertWebp, copy_fonts,copy_fav ,serve, watch
));

// gulp.task('build', gulp.series(
//     styles, utilsScript, scripts , serve , watch
// ));


// When starting, initialize styles, scripts, serve and watch files
gulp.task('default', gulp.series(
    styles, utilsScript, scripts, images_compression, convertWebp, copy_fonts, copy_fav, serve, watch
));