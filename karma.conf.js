// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({       
    browsers: ['Chrome'],       
    frameworks: ['jasmine', 'browserify'],       
    files: ['build/*.spec.js'],       
    plugins : [ 
        'karma-jasmine', 
        'karma-chrome-launcher',
        'karma-browserify',
        'karma-jasmine-html-reporter'],
    preprocessors: {
        'build/*.spec.js': [ 'browserify' ]
    },
    reporters: ['progress', 'kjhtml'],
    client: {
        clearContext: false, // leave Jasmine Spec Runner output visible in browser
        jasmine: {
          random: true,
          oneFailurePerSpec: true,
          failFast: true,
          timeoutInterval: 1000
        }
    },
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: false
  })    
};
