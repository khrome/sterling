var Worker = function(){};
Worker.prototype.isWorking = function(){
    return !!this.jobs;
}

Worker.prototype.complete = function(job){
    var pos = this.jobs.indexOf(job);
    if(pos === -1){
        var jobs = this.jobs;
        this.jobs=undefined;
        jobs.forEach(function(){ job() });
        this.jobs=[];
    }
    ob.jobs.splice(pos, 1);
    if(ob.jobs.length === 0) ob.jobs = undefined;
}

Worker.prototype.work = function(job){
    var ob = this;
    if(this.jobs) return this.jobs.push(job);
    if(job.arguments.length == 1){
           job(function(){
               ob.complete(job);
           });
    }else job();
    return function(){ ob.complete(job) };
}

Worker.implement = function(classDef){
    if(!classDef.prototype) throw new Error(classDef+' is not a class!');
    Object.keys(Worker.prototype).forEach(function(key){
        classDef.prototype[key] = Worker.prototype[key];
    });
};

module.exports = Worker;