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
;

var vendorCssSrcs = [
];

var vendorJsSrcs = [
];

var vendorIeJsSrcs = [
];

var   nunjucksTemplateSource		= 'src/views/'
	, nunjucksViewSource			= 'src/views/**/*.+(html|nunjucks)'
	, nunjucksDataSource			= 'src/data/**/*'
	, nunjucksRenderDestination		= 'dist/render/'
	, vendorsResourceOutput			= 'dist/assets/vendors/'
;

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
	gulp.watch(vendorCssSrcs.concat(vendorJsSrcs.concat(vendorIeJsSrcs)), ['vendor-compiler']);
	gulp.watch([nunjucksViewSource, nunjucksTemplateSource+'**/*', nunjucksDataSource], ['nunjucks']);
});

gulp.task('vendor-compiler', function() {
	gulp.src(vendorCssSrcs)
	.pipe(sourcemaps.init())
	.pipe(concat('vendors.css'))
	.pipe(minifyCss())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(vendorsResourceOutput));

	gulp.src(vendorJsSrcs)
	.pipe(sourcemaps.init())
	.pipe(concat('vendors.js'))
	.pipe(uglify())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(vendorsResourceOutput));

	gulp.src(vendorIeJsSrcs)
	.pipe(sourcemaps.init())
	.pipe(concat('ie-vendors.js'))
	.pipe(uglify())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(vendorsResourceOutput));
});

gulp.task('nunjucks', ['clean-dist-render'], function() {
	nunjucksRender.nunjucks.configure([nunjucksTemplateSource], {watch: false});

	return gulp.src(nunjucksViewSource)
	.pipe(data(getDataForFile))
	.pipe(nunjucksRender({basePath:distBasePath}))
	.pipe(gulp.dest(nunjucksRenderDestination));
});

gulp.task('clean-dist-render', function() {
	return del(nunjucksRenderDestination+'**/*');
});