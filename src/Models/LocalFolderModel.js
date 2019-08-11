import LocalVideoModel from './LocalVideoModel';

class LocalFolderModel {
    constructor(name,path,size,thumb,children){
        this.name =name|"";
        this.path=path|"";
        this.size=size|0;
        this.thumb=thumb|"";
        this.children = children|[];
    }


    /**
     *
     * @param obj
     * @constructor
     */
    static FromJson(obj){
        let newFolder = new LocalFolderModel();
        newFolder.name=obj.name;
        newFolder.path=obj.path;
        newFolder.size=obj.size;
        newFolder.thumb=obj.thumb;
        newFolder.children = obj.children;
        if(newFolder.children){
            for(let i =0; i<newFolder.children.length; i++){
                if(newFolder.children[i].type=="directory"){
                    newFolder.children[i] = LocalFolderModel.FromJson(newFolder.children[i]);
                }else{
                    newFolder.children[i] = LocalVideoModel.FromJson(newFolder.children[i]);
                }


            }
        }
        return newFolder;
    }
}


module.exports = LocalFolderModel;


