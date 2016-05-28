var cache = {};
cache.info = {};
cache.paths = {};
{
	info : function(name){
		return cache.info[name] || (cache.info[name] = require(name+'/package'));
	},
	main : function(name){
		return cache.paths[name] || (cache.paths[name] = require.resolve(name));
	},
	'import' : function(name){
		return cache.paths[name] || (cache.paths[name] = require.resolve(name));
	},
	dependencies : function(name){
		return Object.keys(info.clientDependencies || info.dependencies);
	}
}