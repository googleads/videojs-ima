module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    test: {
      files: ['tests/webdriver/*.js'],
      tasks: 
    },
    vjsdocs: {
      all: {
        src: ['src/videojs.ima.js'],
        dest: 'docs/api',
        options: {
          baseURL: 'https://github.com/googleads/videojs-ima/blob/master/'
        }
      }
    }
  });

  grunt.loadNpmTasks('videojs-doc-generator');

  grunt.registerTask('default', ['vjsdocs']);

  grunt.registerTask('test', 'Run tests', function {
    
  });
};
