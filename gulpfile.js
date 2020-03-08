const {src, dest, watch, task, series, parallel} = require("gulp");

const panini = require("panini");

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
const uglify = require('gulp-uglify');

const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');

const plumber = require("gulp-plumber");

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
function html() {
	panini.refresh();
	return src(path.src.html, { base: "src/" })
	.pipe(plumber())
	.pipe(panini({
		root: 'src/',
		layouts: 'src/tpl/layouts/',
		partials: 'src/tpl/partials/',
		helpers: 'src/tpl/helpers/',
		data: 'src/tpl/data/'
	}))
	.pipe(dest(path.build.html))
	.pipe(gulpif(isSync, browserSync.stream()))
}

function styles() {
	return src(path.src.css, { base: "src/less/" })
    .pipe(plumber())
	.pipe(gulpif(isDev, sourcemaps.init()))
	.pipe(preprocessor())
	.pipe(gcmq())
	.pipe(gulpif(isProd, autoprefixer({
		overrideBrowserslist: ['last 8 versions'],
		cascade: false
	})))
	.pipe(gulpif(isProd, cleanCss({
		level: 2
	})))
	.pipe(gulpif(isDev, sourcemaps.write()))
	.pipe(dest(path.build.css))
	.pipe(gulpif(isSync, browserSync.stream()))
}

function js() {
	return src(path.src.js, {base: './src/js/'})
	.pipe(plumber())
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

function img() {
	return src(path.src.img)
	.pipe(gulpif(isProd, imagemin([
		imageminJpegRecompress({
			progressive: true,
			min: 70, max: 75
		}),
		imageminPngquant({quality: [0.7, 0.75]})
	])))
	.pipe(dest('./build/img'))
	.pipe(gulpif(isSync, browserSync.stream()))
}

function fonts() {
	return src(path.src.fonts)
	.pipe(dest(path.build.fonts))
	.pipe(gulpif(isSync, browserSync.stream()))
}

function clean() {
	return del(path.clean);
}

function watchFiles() {
	if (isSync) {
		browserSync.init({
			server: {
				baseDir: './build/',
				notify: false,
				// online: false, // Work offline without internet connection
			}
		})
	}

	watch([path.watch.html], html);
	watch([path.watch.css], styles);
	watch([path.watch.js], js);
	watch([path.watch.img], img);
	watch([path.watch.fonts], fonts);
	watch('./smartgrid.js', grid);
}

function grid(done) {
	delete require.cache[require.resolve('./smartgrid.js')];

	let settings = require('./smartgrid.js');
	smartgrid('./src/less', settings);
	done();
}

function deploy(cb) {
    ghPages.publish(pathDeploy.join(process.cwd(), './build'), cb);
}

/* Exports Tasks */
// exports.clean = clean;
// exports.html = html;
// exports.css = styles;
// exports.js = js;
// exports.img = img;
// exports.fonts = fonts;
// exports.watch = watchFiles;

exports.deploy = deploy;

let build = series(clean, parallel(html, styles, js, img, fonts));
task('build', series(grid, build));
task('watch', series(build, watchFiles));
task('grid', grid);
