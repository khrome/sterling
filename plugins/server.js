var sterling = new require('../sterling')();
module.exports = function(info){
    if(typeof info === 'string')
    return function(request, response, passthru){
        //todo:detect & serve
        passthru(request, response);
    }
};