Sterling
========

Buildless Development

Sterling is a simple wrapper for dynamic assembly and serving of components via [webpack](https://www.npmjs.com/package/webpack), [director](https://www.npmjs.com/package/director) and [whammo](https://www.npmjs.com/package/whammo) without configuration or build process. Your strategy could be much more sophisticated, involve frameworks or tarot cards... this framework will never have an opinion on that (but if it's not compatible with your favorite poison, please let me know!). Here's an ulta barebones version:

make a file (we'll call it `app.js`) for your client js root: 

		// use require() like crazy
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
	
now, you just work in app.js and as you reload app.js changes will be recompiled. You'll need to restart the server to see changes to your server.js. Go nuts.