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
import Modal from 'react-modal';
import SlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';
import SlidingPlayerPane from './slidingPane/index';
import ExtraPlayer from '../ExtraPlayer/KodiPlayer';



class LocalVideos extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tree: [],
            parentTree:[],
            parentFolderName:[{
                path:"/",
                name:"Root"
            }],
            kodi:{
                ip:"",
                port:""
            },
            player:{
              src:"",
              active:false,
                fileName:""
            },
            isPaneOpen: false,
        };

        this._clickToPlayAll = this._clickToPlayAll.bind(this);
    }


    componentDidMount() {
        this.getFolders();
        Modal.setAppElement(this.el);
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
                                        KODI.killtheServingServer().then(
                                            data=>{
                                                console.log('Server dead');
                                            }
                                        );
                                    }
                                );

                            }catch (e) {
                                toaster.error({
                                    title:_('kodi_playing_error_title'),
                                    text:_('kodi_playing_error_text'),
                                });
                                KODI.killtheServingServer().then(
                                    data=>{
                                        console.log('Server dead');
                                    }
                                );
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
            KODI.killtheServingServer().then(
                data=>{
                    console.log('Server dead');
                }
            );
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
            this.state.tree[index].children &&
            LDB.verifyVideosBasedOnURI(this.state.tree[index].path)
        ){

            let temp = this.state.parentTree;
            temp.push(this.state.tree);
            let newParentFolderName = Object.assign([],this.state.parentFolderName);
            newParentFolderName.push(this.state.tree[index]);
            this.setState({
                parentTree : temp,
                tree: this.state.tree[index].children,
                parentFolderName:newParentFolderName
            });
        }
    }

    navigateBackward(){
       if(this.state.parentTree.length > 0){
           console.log(`Going to check for Exit FS ${this.state.parentTree[this.state.parentTree.length-1]} ${LDB.verifyVideosBasedOnURI(this.state.parentTree[this.state.parentTree.length-1].path)}`);
           if(LDB.verifyVideosBasedOnURI(this.state.parentFolderName[this.state.parentTree.length-1].path)){
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
           }else{
               this.navigateBackwardToSpecificPosition(0);
           }

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
            let pathtoDelete = this.state.tree[index].path;
            this.RemoveExistingDirectory(this.state.tree[index].path);
            let x = this.state.tree;
            x.splice(index,1);
            this.setState(
                {
                    tree : x
                }
            )
            toaster.success(
                {
                    title:"Folder deleted",
                    text:'Deleted folder :'+pathtoDelete
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
            <div ref={ref => this.el = ref}>
                <SlidingPlayerPane
                    title={this.state.fileName}
                    isPaneOpen={this.state.isPaneOpen}
                    onClose={()=>{
                        this.setState({
                            isPaneOpen:false
                        })
                    }}
                    from='bottom'
                    width="100%"
                >
                    {
                        this.state.player.active==true?<ExtraPlayer
                            src={this.state.player.src}
                            width="100%"
                            height="100%"
                        >

                        </ExtraPlayer>:<div></div>
                    }
                </SlidingPlayerPane>
                <div className="tracks-slot">
                    <div className="header clearfix">

                        {/*<i className={headerIconClass}></i>
                        {headerSpan}*/}
                        <ol className="breadcrumb" style={bcstyle}>
                            {/*<li><a href="#">Home</a></li>
                            <li><a href="#">Library</a></li>
                            <li className="active">Data</li>*/}
                            {
                                this.state.parentFolderName.map((obj,index)=>{
                                    return <li className="" key={index*Math.random()}><a href="#" onClick={()=>{
                                        this.navigateBackwardToSpecificPosition(index);
                                    }}>{obj.name}</a></li>
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
                                        console.log("casting to kodi");
                                        this.playOnKodi(folder.path)
                                    }
                                }
                                onLocalPlayClick={
                                    ()=>{
                                        let tempstate =Object.assign({},this.state);
                                        //folder in this case a file and thus it is playable
                                        //activate player
                                        //open pane
                                        tempstate.player.active=true;
                                        tempstate.player.src=folder.path;
                                        tempstate.isPaneOpen=true;
                                        tempstate.fileName=folder.name;
                                        console.log("playing locally");
                                        this.setState(tempstate);
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
            </div>

        );
    }
}

module.exports = LocalVideos;
