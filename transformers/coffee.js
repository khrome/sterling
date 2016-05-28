{
	assemble : function(files, format, done){
		done(undefined, files.map(function(file){ 
			return format('css', file);
		}).join("\n"));
	}
}