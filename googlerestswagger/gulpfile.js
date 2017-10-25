var gulp = require('gulp'),
    nodemon = require('nodemon');

gulp.task('default', function(){
    nodemon({
        script: 'app.js',
        ext: 'js',
        env: {
            PORT:8000
        },
        ignore: ['./node_modules/**']
    })
    on('restart', function(){
        console.log('Restarting');
    });
});
