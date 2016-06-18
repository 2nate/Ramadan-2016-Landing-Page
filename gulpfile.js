var	  gulp				= require('gulp')
	, gutil				= require('gulp-util')
	, nunjucksRender	= require('gulp-nunjucks-render')
	, concat			= require('gulp-concat')
	, uglify			= require('gulp-uglify')
	, minifyCss			= require('gulp-minify-css')
	, sourcemaps		= require('gulp-sourcemaps')
	, data				= require('gulp-data')
	, path				= require('path')
	, fs				= require('fs')
	, del				= require('del')
	, imagemin			= require('gulp-imagemin')
	, sass				= require('gulp-sass')
;

var   nunjucksTemplateSource		= 'src/views/'
	, nunjucksViewSource			= 'src/views/**/*.+(html|nunjucks)'
	, nunjucksDataSource			= 'src/data/**/*'
	, imagesSource					= 'src/images/*'
	, srcResources					= 'src/resources/'
	, srcSassStyle					= srcResources+'/sass/main.scss'
	, fontsSource					= srcResources+'/fonts/**/*'
	, nunjucksRenderDestination		= 'dist/render/'
	, imagesDestination				= 'dist/images/'
	, assetsDestination				= 'dist/assets/'
	, vendorsResourceOutput			= assetsDestination+'vendors/'
	, sassResourceOutput			= assetsDestination+'css/'
	, fontsOutput					= assetsDestination+'fonts/'
;

var vendorSeparateCssSrcs = [
	  srcResources+'css/ie8.css'
	, srcResources+'css/ie9.css'
];

var vendorMixJsSrcs = [
	  srcResources+'js/jquery.min.js'
	, srcResources+'js/jquery.scrollex.min.js'
	, srcResources+'js/jquery.scrolly.min.js'
	, srcResources+'js/skel.min.js'
	, srcResources+'js/util.js'
];

var vendorSeparateJsSrcs = [
	  srcResources+'js/ie/respond.min.js'
	, srcResources+'js/ie/html5shiv.js'
];

var distBasePath = __dirname.replace('\\', '/')+'/dist';

function getDataForFile(file) {
	var dataAddress = __dirname+'\\'+file.path
					  .replace(__dirname+'\\src\\views\\models', 'src\\data')
					  .replace('.+(html|nunjucks)', '.json');

	if (fs.existsSync(dataAddress)) {
		delete require.cache[require.resolve(dataAddress)];
		return require(dataAddress);
	}

	return null;
}

gulp.task('default', ['watch']);

gulp.task('watch', function() {
	gulp.watch(vendorMixJsSrcs.concat(vendorSeparateJsSrcs.concat(vendorSeparateCssSrcs)), ['vendors']);
	gulp.watch([nunjucksViewSource, nunjucksTemplateSource+'**/*', nunjucksDataSource], ['nunjucks']);
	gulp.watch([imagesSource], ['imagemin']);
	gulp.watch([srcSassStyle], ['sass']);
	gulp.watch([fontsSource], ['fonts']);
});

gulp.task('clean-dist-vendors', function() {
	return del(vendorsResourceOutput+'**/*');
});

gulp.task('vendors', ['clean-dist-vendors'], function() {
	gulp.src(vendorMixJsSrcs)
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(vendorsResourceOutput));

	gulp.src(vendorSeparateJsSrcs)
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(vendorsResourceOutput));

	gulp.src(vendorSeparateCssSrcs)
		.pipe(sourcemaps.init())
		.pipe(minifyCss())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(vendorsResourceOutput));
});

gulp.task('clean-dist-render', function() {
	return del(nunjucksRenderDestination+'**/*');
});

gulp.task('nunjucks', ['clean-dist-render'], function() {
	nunjucksRender.nunjucks.configure([nunjucksTemplateSource], {watch: false});

	return gulp.src(nunjucksViewSource)
		  .pipe(data(getDataForFile))
		  .pipe(nunjucksRender({basePath:distBasePath}))
		  .pipe(gulp.dest(nunjucksRenderDestination));
});

gulp.task('clean-dist-images', function() {
	return del(imagesDestination+'**/*');
});

gulp.task('imagemin', ['clean-dist-images'], function() {
	return gulp.src(imagesSource)
		  .pipe(imagemin())
		  .pipe(gulp.dest(imagesDestination))
});

gulp.task('sass', function () {
	return gulp.src(srcSassStyle)
		  .pipe(sourcemaps.init())
		  .pipe(sass().on('error', sass.logError))
		  .pipe(minifyCss())
		  .pipe(sourcemaps.write('./'))
		  .pipe(gulp.dest(sassResourceOutput));
});

gulp.task('fonts', function () {
	return gulp.src([fontsSource])
		  .pipe(gulp.dest(fontsOutput));
});
