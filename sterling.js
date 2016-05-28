var objects = require('async-objects');
var arrays = require('async-arrays');
var fs = require('async-arrays');
var mime = require('mime-types');

var plugins = {
    importers : {}, //fetch a module
    assemblers : {}, //group a type of asset
    transformers : {}, //convert from a meta-format to a primary format
    exporters : {} //format assets for a transport type
};


function file(name, cb){
    return fs.readFile(name, cb); 
}

function filesOfType(importer, module, type, cb){
    var mimeType = mime.lookup(type);
    importer.files(module, function(files){
        var result = files.filter(function(file){
            return mime.lookup(file) === mimeType;
        });
        if(cb) cb(result);
    })
}

function allTypes(importer, cb){
    var results = [];
    importer.files(function(files){
        var type = mime.lookup(file);
        if(results.indexOf(type) === -1) results.push(type);
        if(cb) cb(results);
    });
}

var versionSensitive = {};

function cacheId(name){
    return name;
};

function crawlPackageTreeNode(name, instance, context, handler, lineage, callback){
        var importer = instance.importer;
        var location = require.resolve(name);
        //todo: handle direct file reference
        var info = importer.info(name);
        var control = {
            module : info,
            files : function(type, cb){
                filesOfType(importer, name, type, function(err, files){
                    if(cb) cb(err, files);
                }
            },
            text : function(type, cb){
                filesOfType(importer, name, type, function(err, files){
                    array.forEachEmission(files, function(filename, key, done){
                       file(function(err, body){
                           if(err) throw err;
                           done(body||'');
                       });
                    });
                }
            }
        };
        var subtree = function(cb){
               arrays.forEachEmission(dependencies, function(dependency, key, done){
                   if(!instance.seen[cacheId(dependency)]){
                       crawlPackageTreeNode(
                            dependency,
                            instance,
                            context,
                            handler,
                            lineage.concat(dependency),
                            function(){
                                done();
                            }
                        )
                    }else done();
               }, function(){
                   if(cb) cb();
               });
            });
        };
        if(handler.arguments.length == 3){
            handler(name, control, function(){
                subtree(function(){ if(callback) callback() });
            });
        }else{
            handler(name, control);
            subtree(function(){ if(callback) callback() });
        }
        if(!instance.seen[cacheId(name)]) instance.seen[cacheId(name)] = true;
}

function crawlPackageTree(rootPackage, instance, nodeHandler, callback){
    var context = {seen:{}};
    if(Array.isArray(rootPackage)){
        arrays.forEachEmission(rootPackage, function(dependency, key, done){
           crawlPackageTreeNode(rootPackage, instance, context, nodeHandler, [], done);
        }, function(){
            if(callback) callback();
        });
    }else{
        return crawlPackageTreeNode(rootPackage, instance, context, nodeHandler, [], callback);
    }
}

function trimType(str){
    var name = str.split('.');
    name.pop();
    return name.join('.');
}

var Sterling = function(){
    var jobs = [];
    this.ready = function(job){ jobs.push(job) };
    var count = 0;
    var ob = this;
    var loadPlugins = function(type, cb){
        count++;
        fs.readdir(__dirname+'/'+type, function(err, data){
            if(err) return finish(err);
            arrays.forAllEmissions(data, function(filename, key, done){
                var name = trimType(filename);
                assemblers[name] = require(__dirname+'/'+type+'/'+filename);
                done();
            }, function(){
                if(cb) cb();
            });
        });
    }
    this.imports = {};
    this.work(function(){
        
    })
    loadPlugins('exporters');
    loadPlugins('importers');
    loadPlugins('assemblers');
    loadPlugins('transformers');
};

require('./sterling-worker').implement(Sterling);

Sterling.prototype.addModule = function(module, callback){
    this.work(function(complete){
        crawlPackageTreeNode(rootPackage, instance, function(name, controls, done){
            importer.import(name, function(err, imported){
                ob.imports[name] = imported;
                done();
            });
        }, function(){
            if(callback) callback();
            complete();
        });
    });
}

Sterling.prototype.export = function(options, callback){
    var exporter = options.exporter || exporters[this.options.exporter];
    this.work(function(complete){
        allTypes(importer, function(err, types){
            var results = {};
            array.forAllEmissions(types, function(type){
                filesOfType(importer, undefined, type, function(err, files){
                    var result = [];
                    array.forAllEmissions(files, function(filename, key, done){
                        file(filename, function(err, body){
                            result[key] = body;
                            done();
                        })
                    }, function(){
                        assemblers[type].assemble(result, exporter.format, function(err, assembled){
                            exporter.export(type, function(err, exported){
                                results[type] = exported;
                            });
                        });
                    });
                });
            }, function(){
                if(callback) callback(undefined, results);
                complete();
            });
        });
    });
}

Sterling.sticky = {};


Sterling.Worker = require('./sterling-worker');

module.exports = Sterling;