var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var browserSync = require('browser-sync').create();

// Compile sass
gulp.task('css', function() {
  gulp.src('themes/hugo-cactus-theme/static/sass/*.scss')
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('themes/hugo-cactus-theme/static/css/'))
    .pipe(browserSync.reload({
        stream: true
    }))
});

// Watch for stylesheet changes
gulp.watch('themes/hugo-cactus-theme/static/sass/partials/*.scss', ['css']);

gulp.task('default', ['css']);
