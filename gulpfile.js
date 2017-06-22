var gulp 				= require('gulp');
var uglify 			= require('gulp-uglify');
var sass 				= require('gulp-sass');
var cleanCSS 		= require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var imagemin 		= require('gulp-imagemin');
var browserSync = require('browser-sync').create();
var panini 			= require('panini');
var concat 			= require('gulp-concat');

gulp.task('sass', function() {
	gulp.src('src/assets/sass/*.sass')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer())
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