// GLOBAL
const config = require('./.gulprc.json');
const livereload = require('gulp-livereload');
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');

const gulp = require('gulp');

// DEFAULT
gulp.task('watch', async () => {
	livereload.listen(1337);
	gulp.watch(config.paths.cssAll, gulp.series('css'));
	gulp.watch(config.paths.cssSubFold, gulp.series('css'));
	gulp.watch(config.paths.jsSrc, gulp.series('js'));
	gulp.watch(config.paths.bmpSrc, gulp.series('img'));
	gulp.watch(config.paths.svgSrc, gulp.series('img'));
});

gulp.task('default', gulp.series('watch'));

// INIT
gulp.task('init', async () => {
	css('dev');
	postJs('dev');
	imagesBMP('dev');
});

// PROD
gulp.task('prod', async () => {
	css('prod');
	postJs('prod');
});

// CSS
gulp.task('css', async () => {
	css('dev');
});

function css(arg) {
	const isDev = arg === 'dev';
	const isProd = arg === 'prod';
	const postcss = require('gulp-postcss');
	const assets = require('postcss-assets');
	const postcssPresetEnv = require('postcss-preset-env');
	const cssnano = require('gulp-cssnano');

	const process = [
		require('postcss-import'),
		assets({ loadPaths: [config.paths.bmpDest, config.paths.svgDest] }),
		require('postcss-url'),
		postcssPresetEnv({
			stage: 0,
			browsers: ['> 5%', 'last 2 versions', 'IE > 11', 'iOS 9']
		})
	];

	return gulp
		.src(config.paths.cssSrc)
		.pipe(sourcemaps.init())
		.pipe(postcss(process))
		.pipe(gulpif(isProd, cssnano()))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.paths.cssDest))
		.pipe(gulpif(isDev, livereload()));
}

// JS
gulp.task('js', async () => {
	preJs();
	postJs('dev');
});

function preJs() {
	const eslint = require('gulp-eslint');

	return gulp
		.src(config.paths.jsSrc)
		.pipe(plumber())
		.pipe(eslint())
		.pipe(eslint.format());
}

function postJs(arg) {
	const isDev = arg === 'dev';
	const isProd = arg === 'prod';
	const browserify = require('browserify');
	const source = require('vinyl-source-stream');
	const buffer = require('vinyl-buffer');
	const babelify = require('babelify');
	const babelCore = require('@babel/core');
	const babelPresetEnv = require('@babel/preset-env');
	const uglify = require('gulp-uglify');

	const bundler = browserify({
		entries: config.paths.jsSrc
	});

	return bundler
		.transform(babelify, { presets: [babelPresetEnv] })
		.bundle()
		.pipe(source('app.bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(gulpif(isProd, uglify()))
		.pipe(gulp.dest(config.paths.jsDest));
}

// IMG
gulp.task('img', async () => {
	imagesBMP();
	imagesSVG();
});

function imagesBMP() {
	const newer = require('gulp-newer');
	const imagemin = require('gulp-imagemin');
	const pngquant = require('imagemin-pngquant');

	return gulp
		.src(config.paths.bmpSrc)
		.pipe(plumber())
		.pipe(newer(config.paths.bmpDest))
		.pipe(
			imagemin({
				progressive: true,
				use: [pngquant()]
			})
		)
		.pipe(gulp.dest(config.paths.bmpDest));
}

function imagesSVG() {
	const svgSprite = require('gulp-svg-sprite');

	return gulp
		.src(config.paths.svgSrc)
		.pipe(plumber())
		.pipe(
			svgSprite({
				shape: {
					transform: ['svgo']
				},
				mode: {
					symbol: {
						inline: true,
						example: false,
						sprite: '../sprite.svg'
					}
				}
			})
		)
		.pipe(gulp.dest(config.paths.svgDest));
}
