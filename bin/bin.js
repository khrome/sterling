#!/usr/bin/env node
var Loader = require('../loader');
var loader = new Loader();
loader.yargs.usage('Usage: $0 [options]')
    .example('$0 -c ~/my/config.json', 'run using the data in the config file')
    .alias('s', 'service')
        .nargs('s', 1)
        .describe('s', 'which service to start')
        .alias('l', 'legacy-mode')
            .nargs('l', 0)
            .describe('l', 'use the old arg mapping')
    .help('h').alias('h', 'help')
    .epilog('copyright '+(new Date()).getFullYear())
var support = loader.support();
if(loader.yargs.argv.l){
    support.database(true);
    support.mapbox();
}else{
    support.database('mysql');
}
loader.load(require(
    process.cwd()+'/'+(loader.yargs.argv.s || 'service')
));
return loader;
