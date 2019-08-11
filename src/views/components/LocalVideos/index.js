import React, { Component } from 'react';
import TopRanking from 'kaku-core/modules/TopRanking';
import TracksComponent from '../shared/tracks';
import Player from '../../modules/Player';
import LDB from '../../../modules/LocalDatabaseManager';
import Folder from "./Folder";
import KODI from "../../../modules/KodiPlayer"
import kodiPlayerManager from '../../../modules/KodiPlayerManager';
import Constants from "../../../modules/Constants";
const {dialog} = require('electron').remote;
import Notifier from '../../modules/Notifier';
import L10nManager from "../../../modules/L10nManager";
const loadingPageDOM = document.querySelector('.loading-page');
const _ = L10nManager.get.bind(L10nManager);
import toaster from  "../../../modules/toastrWrapper";

class LocalVideos extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tree: [],
            parentTree:[],
            parentFolderName:["Root"],
            kodi:{
                ip:"",
                port:""
            }
        };

        this._clickToPlayAll = this._clickToPlayAll.bind(this);
    }

    componentDidMount() {
        this.getFolders();
    }

    getFolders(){
        LDB.getFoldersStoredInDatabase().then(
            tree=>{
                this.setState({
                    tree:tree
                });
            }
        )
    }

    playOnKodi(filePath){
        try{
            kodiPlayerManager.getKodiSettings().then(
                data=>{
                    this.setState(
                        {
                            kodi:{
                                ip:data.settings.ip,
                                port:data.settings.port,
                            }
                        },()=>{
                            try{
                                KODI.PlayNow(filePath,this.state.kodi.ip,this.state.kodi.port).then(
                                    data=>{
                                        toaster.info({
                                            title:_('kodi_playing_should_start_title'),
                                            text:_('kodi_playing_should_start_text'),
                                        });
                                    }
                                ).catch(
                                    err=>{
                                        toaster.error({
                                            title:_('kodi_playing_error_title'),
                                            text:_('kodi_playing_error_text'),
                                        });
                                    }
                                );

                            }catch (e) {
                                toaster.error({
                                    title:_('kodi_playing_error_title'),
                                    text:_('kodi_playing_error_text'),
                                });
                            }
                        }
                    )
                }
            )
        }catch(e){
            toaster.error({
                title:_('kodi_playing_error_title'),
                text:_('kodi_playing_error_text'),
            });
        }


    }

    hideLoadingScreen(){
        loadingPageDOM.hidden = true;
    }
    showLoadingScreen(){
        loadingPageDOM.hidden = false;
    }

    _clickToPlayAll() {
        let noUpdate = true;
        Player.cleanupTracks(noUpdate);
        Player.addTracks(this.state.tracks);
        Player.playNextTrack(0);
    }

    AddNewDirectory(dir){
        Notifier.alert(_('main_adding_local_folder'));
        this.showLoadingScreen()
        return new Promise((res,rej)=>{
            setTimeout(()=>{
                LDB.saveFileStructureToDB(dir).then(
                    data=>{
                        res(data);
                        this.hideLoadingScreen();
                    }
                ).catch(
                    err=>{
                        rej(err);
                        this.hideLoadingScreen();
                    }
                );
            },650)

        })

    }

    RemoveExistingDirectory(dir){
        return LDB.deleteFileFromFileStructure(dir);
    }

    navigateForward(index){
        if(
            this.state.tree[index].children
        ){

            let temp = this.state.parentTree;
            temp.push(this.state.tree);
            let newParentFolderName = Object.assign([],this.state.parentFolderName);
            newParentFolderName.push(this.state.tree[index].name);
            this.setState({
                parentTree : temp,
                tree: this.state.tree[index].children,
                parentFolderName:newParentFolderName
            });
        }
    }

    navigateBackward(){
       if(this.state.parentTree.length > 0){
           console.log("going back inside")
           let temp = this.state.parentTree[this.state.parentTree.length-1];
           let newParentTree = Object.assign([],this.state.parentTree);
           newParentTree.pop();
           let newParentFolderName = Object.assign([],this.state.parentFolderName);
           newParentFolderName.pop();
           this.setState({
               parentTree : newParentTree,
               tree: temp,
               parentFolderName:newParentFolderName
           });
       }
    }

    navigateBackwardToSpecificPosition(index){
        console.log(index);
        console.log(this.state.parentTree.length);
        let numberOfBacks = this.state.parentTree.length - index;

        if(numberOfBacks>0){
            let temp = this.state.parentTree[this.state.parentTree.length-numberOfBacks];
            let newParentTree = Object.assign([],this.state.parentTree);

            let newParentFolderName = Object.assign([],this.state.parentFolderName);
            for(let i=0; i< numberOfBacks; i++){
                newParentTree.pop();
                newParentFolderName.pop();
            }
            this.setState({
                parentTree : newParentTree,
                tree: temp,
                parentFolderName:newParentFolderName
            });
        }
    }


    showFolderSelectDialog(){
        var path = dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        this.AddNewDirectory(path[0]).then(
            data=>{
                console.log(data);
                this.getFolders();
            }
        );
    }

    deletefileDromDbOnIndex(index){

        if(this.state.parentTree.length==0){
            //this means you are in the root folder and you can delete folders
            console.log(this.state.tree);
            this.RemoveExistingDirectory(this.state.tree[index].path);
            let x = this.state.tree;
            x.splice(index,1);
            this.setState(
                {
                    tree : x
                }
            )


        }
    }

    render() {
        let tracks = this.state.tracks;
        let controls = {
            trackModeButton: true,
            playAllButton: true,
            deleteAllButton: false,
            addToPlayQueueButton: true
        };
        let bcstyle={
            marginBottom:0
        };
        console.log(this.state.tree);
        return (
            <div className="tracks-slot">
                <div className="header clearfix">

                        {/*<i className={headerIconClass}></i>
                        {headerSpan}*/}
                        <ol className="breadcrumb" style={bcstyle}>
                            {/*<li><a href="#">Home</a></li>
                            <li><a href="#">Library</a></li>
                            <li className="active">Data</li>*/}
                            {
                                this.state.parentFolderName.map((name,index)=>{
                                    return <li className="" key={index*Math.random()}><a href="#" onClick={()=>{
                                        this.navigateBackwardToSpecificPosition(index);
                                    }}>{name}</a></li>
                                })
                            }

                        </ol>

                    <div className="control-buttons">
                        {/*{trackModeButton}
                        {addToPlayQueueButton}
                        {deleteAllButton}
                        {playAllButton}*/}
                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className="btn btn-default"
                                data-mode="list"
                                onClick={()=>{this.showFolderSelectDialog()}}>
                                <i className="fa fa-fw fa-plus"></i>
                            </button>
                        </div>
                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className="btn btn-default"
                                data-mode="list"
                                onClick={()=>{this.navigateBackward()}}>
                                <i className="fa fa-fw fa-backward"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="tracks-component">
                    {this.state.tree.map((folder,index)=>{
                        return <Folder
                            key={index+folder.name}
                            onClick={()=>this.navigateForward(index)}
                            onPlayClick={
                                ()=>{
                                    console.log("essqdqsd");
                                    this.playOnKodi(folder.path)
                                }
                            }
                            onDeleteClick={
                                ()=>{
                                    this.deletefileDromDbOnIndex(index);
                                }
                            }
                            folder={folder}
                        >
                        </Folder>
                    })}
                </div>
            </div>
        );
    }
}

module.exports = LocalVideos;
