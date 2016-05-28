var tags = [
	'<script id="@", type="template/live-handlebars">',
	'</script>'
];
{
	assemble : function(files, format, done){
		done(undefined, files.map(function(file){ 
			return tags[0].replace('@', file)+format(file)+tags[1];
		}).join("\n"));
	}
}