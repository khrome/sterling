var Emitter = require('extended-emitter');
var Server = require('whammo');
var directorAdapter = require('whammo/routers/director');
var director = require('director');
var webpack = require("webpack");
var fs = require("fs");

var appRoot = process.cwd();
var scratch = './bin';


var Sterling = function(options){
    var ob = this;
    this.application = (options.express?require('micro-serve').express(options.express)(this):new Server());
    this.options = options || {};
    if(!this.options.routes) this.options.routes = {};
    if(!this.options.types) this.options.types = [
        'png', 'gif', 'jpg', 'jpeg', 'json', 'js', 'html', 'css',
        'ttf', 'eot', 'woff', 'ico', 'otf', 'svg', 'handlebars', 'woff2'
    ];
    if(this.options.externals && Array.isArray(this.options.externals)){
        var externs = {};
        this.options.externals.forEach(function(name){
            externs[name] = true;
        });
        this.options.externals = externs;
    }
    this.options.routes['/r/:type/:file'] = {get:function(type, file){
        switch(type.toLowerCase()){
            case 'jsdeps':
                var lastDot = file.lastIndexOf('.');
                var bundleName = file.substring(0, lastDot)+'.bundle'+file.substring(lastDot);
                var res = this.res;
                var externs = ob.options.externals;
                fs.exists(file, function(exists){
                    if(exists){
                        ob.setup({
                            entry: './'+file,
                            output: {
                                path: scratch,
                                filename: bundleName
                            },
                            externals: externs
                        }, function(err, results){
                            if(err) console.log(err, results.toJson("verbose"));
                            if(!err){
                                fs.readFile(file, function(fileErr, body){
                                    fs.readFile(scratch+'/'+bundleName, function(fileErr, depsBody){
                                        res.end(depsBody);
                                    });
                                });
                            }
                        });
                    }else{
                        res.end('Not a valid resource');
                    }
                });
                break;
            case 'js':
                fs.readFile(appRoot+file)
                break;
            default : 
                this.res.end('Unsupported type: '+type);
        }
        
    }};
    this.router = new director.http.Router(this.options.routes);
    if(this.options.all){
        this.router.configure({on:this.options.all});
    }
    directorAdapter.routeHTTP(this.application, this.router, this.options);
    if(this.options.port) this.application.listen(this.options.port);
};

Sterling.prototype.setup = function(options, cb){
    var compiler = webpack(options);
    if(this.options.watch){
        compiler.watch({
            aggregateTimeout: 300, // wait so long for more changes
            poll: true // use polling instead of native watchers
            // pass a number to set the polling interval
        }, cb);
    }else{
        compiler.run(cb);
    }
}

Sterling.prototype.addRoute = function(route, handler){
    this.router.addRoute(route, handler);
}

Sterling.prototype.serve = function(port){
    this.application.listen(port);
}

Sterling.Worker = require('./sterling-worker');

module.exports = Sterling;