'use strict';

// Подключения зависимостей
const { src, dest, watch, task, series,	parallel} = require("gulp");

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

const fileinclude = require('gulp-file-include');

const autoprefixer = require('gulp-autoprefixer');
const preprocessor = require('gulp-less');
const cleanCss = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const sourcemaps = require('gulp-sourcemaps');

const del = require('del');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const smartgrid = require('smart-grid');
const concat = require('gulp-concat');

const rigger = require("gulp-rigger");
const uglify = require('gulp-uglify-es').default;

const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');

const ghPages = require('gh-pages');
const pathDeploy = require('path');

const isDev = process.argv.includes('--dev');
const isProd = !isDev;
const isSync = process.argv.includes('--sync');

/* Paths */
var path = {
	src: {
		html: "src/*.html",
		js: "src/js/*.js",
		css: "src/less/styles.less",
		img: "src/img/**/*.{jpg,png,svg,gif,ico,webmanifest,xml}",
		fonts: "src/fonts/*.{woff2,woff,eot,ttf}"
	},
	build: {
		html: "build/",
		js: "build/js/",
		css: "build/css/",
		img: "build/img/",
		fonts: "build/fonts/"
	},
	watch: {
		html: "src/**/*.html",
		js: "src/js/**/*.js",
		css: "src/less/**/*.less",
		img: "src/img/**/*.{jpg,png,svg,gif,ico,webmanifest,xml}",
		fonts: "src/fonts/*.{woff2,woff,eot,ttf}"
	},
	clean: "./build/*"
}

/* Tasks */

// Сборка HTML
function html() {
	console.log('---------- сборка HTML');
	return src(path.src.html)
		.pipe(plumber({
			errorHandler: function(err) {
			notify.onError({
				title: 'HTML compilation error',
				message: err.message
			})(err);
			this.emit('end');
			}
		}))
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file',
			indent: true,
		  }))
		.pipe(dest(path.build.html))
		.pipe(gulpif(isSync, browserSync.stream()))
}

// Компиляция стилей
function styles() {
	console.log('---------- Компиляция стилей');
	return src(path.src.css)
		.pipe(plumber({
			errorHandler: function(err) {
			notify.onError({
				title: 'Styles compilation error',
				message: err.message
			})(err);
			this.emit('end');
			}
		}))
		.pipe(gulpif(isDev, sourcemaps.init()))
		.pipe(preprocessor())
		.pipe(gcmq())
		.pipe(gulpif(isProd, autoprefixer({
			overrideBrowserslist: ['last 10 versions'],
		})))
		.pipe(gulpif(isProd, cleanCss({
			level: 2
		})))
		.pipe(gulpif(isDev, sourcemaps.write()))
		.pipe(dest(path.build.css))
		.pipe(gulpif(isSync, browserSync.stream()))
}

// Конкатенация и углификация Javascript
function js() {
	console.log('---------- Обработка JS');
	return src(path.src.js, {
			base: './src/js/'
		})
		.pipe(plumber({
			errorHandler: function(err) {
			  notify.onError({
				title: 'Javascript error',
				message: err.message
			  })(err);
			  this.emit('end');
			}
		}))
		.pipe(rigger())
		.pipe(gulpif(isDev, sourcemaps.init()))
		.pipe(concat('script.js'))
		.pipe(gulpif(isProd, uglify({
			toplevel: true
		})))
		.pipe(gulpif(isDev, sourcemaps.write()))
		.pipe(dest(path.build.js))
		.pipe(gulpif(isSync, browserSync.stream()))
}

// Копирование изображений
function img() {
	console.log('---------- Копирование изображений');
	return src(path.src.img)
		.pipe(gulpif(isProd, imagemin([
			imageminJpegRecompress({
				progressive: true,
				min: 70,
				max: 75
			}),
			imageminPngquant({
				quality: [0.7, 0.75]
			})
		])))
		.pipe(dest('./build/img'))
		.pipe(gulpif(isSync, browserSync.stream()))
}

// Копирование шрифтов
function fonts() {
	console.log('---------- Копирование шрифтов');
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
		.pipe(gulpif(isSync, browserSync.stream()))
}

// Очистка папки сборки
function clean() {
	console.log('---------- Очистка папки сборки');
	return del(path.clean);
}

// Локальный сервер, слежение
function watchFiles() {
	if (isSync) {
		browserSync.init({
			server: {
				baseDir: './build/'
			},
			open: false
			// online: false, // Work offline without internet connection
		})
	}

	watch([path.watch.html], html);
	watch([path.watch.css], styles);
	watch([path.watch.js], js);
	watch([path.watch.img], img);
	watch([path.watch.fonts], fonts);
	watch('./smartgrid.js', grid);
}

// Перестроение сетки
function grid(done) {
	console.log('---------- Перестроение сетки');
	delete require.cache[require.resolve('./smartgrid.js')];

	let settings = require('./smartgrid.js');
	smartgrid('./src/less', settings);
	done();
}

// Отправка в GH pages (ветку gh-pages репозитория)
function deploy(cb) {
	console.log('---------- Публикация содержимого ./build/ на GH pages');
	ghPages.publish(pathDeploy.join(process.cwd(), './build'), cb);
}

/* Exports Tasks */
exports.clean = clean;
exports.html = html;
// exports.css = styles;
exports.js = js;
// exports.img = img;
// exports.fonts = fonts;
// exports.watch = watchFiles;

exports.deploy = deploy;

let build = series(clean, parallel(html, styles, js, img, fonts));
task('build', series(grid, build));
task('watch', series(build, watchFiles));
task('grid', grid);
