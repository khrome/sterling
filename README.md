Sterling
========

Buildless Development : standalone or inside [express]()

Sterling is a simple wrapper for dynamic assembly and serving of components via [webpack](https://www.npmjs.com/package/webpack), [director](https://www.npmjs.com/package/director) and [whammo](https://www.npmjs.com/package/whammo) without configuration or build process. Your strategy could be much more sophisticated, involve frameworks or tarot cards... this framework will never have an opinion on that (but if it's not compatible with your favorite poison, please let me know!). Here's an ulta barebones version:

make a file (we'll call it `app.js`) for your client js root: 

		// use require() like crazy...
		// as long as it is installed and compatible with webpack
		// it 'just works'
		window.globalSetup = function(){
			//do things with the DOM while continuing to abuse require()
		};
	
next make a file for your html root (`index.html`):

		<html>
		    <head>
		        <script src="/r/jsdeps/app.js"></script>
		    </head>
		    <body onload="globalSetup();">
		        <!-- A page full of awesome -->
		    </body>
		</html>
	
Last you'll need a server (`server.js`)

		var Sterling = require('sterling');
		var app = new Sterling({
		    routes : { //director routes format
		        '/my/route/with/:value' : {get:function(value){
		            // do stuff with this.res & this.req
		        }}
		    },
		    externals : { //webpack externs format
		        'module-name' : 'var moduleVariableName'
		    },
		});
		app.serve(<port#>);
		
Additional options on the Server object are:

- **express** : an instance of express you'd like Sterling to run as middleware inside of
- **types** : an `Array` of legal filetypes for transfer (anything not matching these will 404, even if existant).
- **autoParseBody** : have the framework automatically pull the POST content and also attempt to parse it, both as JSON, then as querystring arguments. By default only the GET parameters on the url are parsed.
	
now, you just work in app.js and as you reload app.js changes will be recompiled. You'll need to restart the server to see changes to your server.js. Go nuts.