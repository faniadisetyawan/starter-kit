var gulp 				= require('gulp');
var uglify 			= require('gulp-uglify');
var sass 				= require('gulp-sass');
var cleanCSS 		= require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var imagemin 		= require('gulp-imagemin');
var browserSync = require('browser-sync').create();
var panini 			= require('panini');
var concat 			= require('gulp-concat');
var realFavicon = require ('gulp-real-favicon');
var fs 					= require('fs');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';
// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: 'src/assets/images/favicon.png',
		dest: 'src/assets/images/favicon',
		iconsPath: '{{root}}assets/images/favicon',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
	return gulp.src([ 'src/layouts/*.html' ])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('dist'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});

gulp.task('sass', function() {
	gulp.src('src/assets/sass/*.sass')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 5%'],
		}))
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(browserSync.stream())
});

gulp.task('stylesheet', function() {
	gulp.src([
		'./bower_components/bootstrap/dist/css/bootstrap.min.css',
		'./bower_components/simple-line-icons/css/simple-line-icons.css'
	])
		.pipe(concat('vendor.css'))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist/assets/vendor'))
});

gulp.task('javascript', function() {
	gulp.src([
		'./bower_components/jquery/dist/jquery.min.js',
		'./bower_components/bootstrap/dist/js/bootstrap.min.js'
	])
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/vendor'))
});

gulp.task('fonts', function() {
	gulp.src([
		'./bower_components/simple-line-icons/fonts/**/*'
	])
		.pipe(gulp.dest('dist/assets/fonts'))
});

gulp.task('scripts', function() {
	gulp.src('src/assets/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/js'))
});

gulp.task('images', function() {
	gulp.src('src/assets/images/**/*')
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
	    imagemin.jpegtran({progressive: true}),
	    imagemin.optipng({optimizationLevel: 5}),
	    imagemin.svgo({plugins: [{removeViewBox: true}]})
		]))
		.pipe(gulp.dest('dist/assets/images'))
});

gulp.task('panini', function() {
	gulp.src('src/pages/**/*.html')
		.pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      helpers: 'src/helpers/',
      data: 'src/data/'
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', ['sass', 'scripts', 'images'], function() {
	gulp.watch('src/assets/sass/*.sass', ['sass']);
	gulp.watch('src/assets/js/*.js', ['scripts']);
	gulp.watch('src/assets/images/**/*', ['images']);
});

gulp.task('serve', ['watch', 'stylesheet', 'javascript', 'fonts'], function() {
	browserSync.init({
		server: './dist'
	})
});

gulp.task('default', ['serve']);