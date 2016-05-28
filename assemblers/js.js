{
	assemble : function(files, format, done){
		done(undefined, files.map(function(file){ 
			return format(file);
		}).join("\n"));
	}
}