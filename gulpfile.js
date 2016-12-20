var exec = require("child_process").exec,
    gulp = require("gulp"),
    nodemon = require("gulp-nodemon");

gulp.task('server', function (cb) {

    nodemon({
        script: 'app.js',
        ext: 'js html',
        env: { 'NODE_ENV': 'development' }
    });
    exec('mongod.exe', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
})