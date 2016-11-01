'use strict';

module.exports = {

	// BrowserSync
    'browserport': 35729,
    'proxy': 'http://contiki.local',
    'serverport': 35727,
    'serverstart': 'index.html',
    'uiport': 35728,

     // Browserify
    'browserify': {
        'dest': "",//'../Contiki.Website/Content/js',
        'entries': [],//['./src/js/main.js'],
        'bundleName': "",//'main.js',
        'sourcemap': true,
        'libs': [
          { /*require: './src/js/plugins.js', expose: 'plugins'*/ }
        ],
        'libName': ""//'libs.js'
    },

    // Watch
    'watch': "./standalone/server/main-page/scss/**/*.scss",

	// Sass
	'styles': {
		'src': ['!./standalone/server/main-page/scss/projects/**/*.scss','./standalone/server/main-page/scss/*.scss', './standalone/server/main-page/scss/*.sass'],
		'dest': './standalone/server/main-page/css',
		'include': './node_modules/susy/sass'
	},

    //Sass projects
    'styles_projects': [
        //Paginator
        {
            'src': './standalone/server/main-page/scss/projects/paginator/*.scss',
            'dest': './standalone/server/main-page/css/paginator',
            'include': './node_modules/susy/sass'
        }
    ],

};
