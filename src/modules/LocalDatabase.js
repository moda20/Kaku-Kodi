var fs = require('fs');
var path = require('path')
const dirTree = require("directory-tree");



var videoFiles = ["mp4","mkv"];
var walk = function(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else {
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}
var results = {
    path:"",
    files :[],
    errors :[]
};
/**
 *
 * @param dirPath
 * @returns {Array}
 */
var readVideoFilesFromDirectory = function(dirPath,tree){

    if(!tree) {
        var filteredTree = dirTree(dirPath, {
            extensions: /\.(mp4|avi|mkv)$/
        });
    }else{
        var filteredTree = tree;
    }
    if(filteredTree==null){
        return {};
    }
    var getridOfEmptyFolders = function(folder){
        if(folder.type=="directory"){
            if(folder.children.length==0){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    for (let i =0; i< filteredTree.children.length; i ++){
        if(filteredTree.children[i].type=="directory"){
            if(getridOfEmptyFolders(filteredTree.children[i])){
                filteredTree.children.splice(i,1);
                i=i-1;

            }else{
                for (let j =0; j< filteredTree.children[i].children.length; j ++){
                    if(filteredTree.children[i].children[j].type=="directory"){
                        readVideoFilesFromDirectory(null,filteredTree.children[i].children[j]);
                        if(getridOfEmptyFolders(filteredTree.children[i].children[j])){
                            filteredTree.children[i].children.splice(j,1);
                            j=j-1;
                        }else {

                        }
                    }else{

                    }

                }
                if(getridOfEmptyFolders(filteredTree.children[i])){
                    filteredTree.children.splice(i,1);
                    i=i-1;
                }else{

                }
            }
        }else{

        }
    }
    return filteredTree;

};

/**
 *
 * @param ogfiles Must be something like this :
 * var ogfiles = {
        path:"",
        pathname:"",
        files :[],
        folders:[]
    };
 */
var getRidOfEmptyFolders =function(ogfiles){
    let files = Object.assign({}, ogfiles);

    for (let i =0; i <files.folders.length; i ++){
        fs.appendFileSync("./log","folder : "+files.folders[i].pathname+ "  => "+files.folders[i].files.length+ " / "+ files.folders[i].folders.length+"\n");
        if( files.folders[i].files.length == 0 && files.folders[i].folders.length ==0){
           // fs.appendFileSync("./log","trimmed ONe : "+files.folders[i].path);
            files.folders.splice(i,1);

        }else{
            getRidOfEmptyFolders(files.folders[i]);
        }
    }
    return files;
}


/**
 *
 * @param files
 *  * Should be a list of URIs
 * @returns {{folders: Array, data: {}}|*}
 */
var regroupfilesByFolder = function (files){
    var tree = {
        // Represents the "root" directory, like in a filesystem.
        root: {
            absolute_path: '',
            files: []
        }
    };

    function buildTree(parts) {
        var lastDir = 'root';
        var abs_path = '';

        parts.forEach(function(name) {
            // It's a directory
            if (name.indexOf('.') === -1) {
                lastDir = name;
                abs_path += lastDir + '/';

                if (!tree[name]) {
                    tree[name] = {
                        absolute_path: abs_path,
                        files: []
                    };
                }
            } else {
                tree[lastDir].files.push(name);
            }
        });
    }

    files.forEach(function(path, index, array) {
        buildTree(path.split('/'));
    });
    return tree;
}

/*let res  = readVideoFilesFromDirectory("/Users/kadhem/Documents/testing folder");
console.log(res);*/



module.exports = {
    ReadVideoFilesFromDirectory:readVideoFilesFromDirectory
}
