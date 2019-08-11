




class LocalVideoModel {
    constructor(name,path,size,thumb){
        this.name =name|"";
        this.path=path|"";
        this.size=size|0;
        this.thumb=thumb|"";
    }

    /**
     *
     * @param obj
     * @constructor
     */
    static FromJson(obj){
        let newVideo = new LocalVideoModel();
        newVideo.name=obj.name;
        newVideo.path=obj.path;
        newVideo.size=obj.size;
        newVideo.thumb=obj.thumb;
        newVideo.duration = obj.duration?obj.duration:0;
        return newVideo;
    }
}


module.exports = LocalVideoModel;
