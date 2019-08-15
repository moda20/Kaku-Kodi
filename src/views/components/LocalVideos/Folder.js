import React, { Component } from 'react';
import image from '../../../public/images/folder-icon.png';
import videoImage from '../../../public/images/video-icon.png';
import "./css/index.css";


class Folder extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }



    isThisAFile(){
        if(this.props.folder.children){
            return false;
        }else{
            return true;
        }
    }


    hoverbuttons({
                     onFirstClick,
                     onSecondClick
                 }){
        if(this.isThisAFile()==true){
            return [
                < div className = "fileoverlay" > </div>,
                <div className="HoverFolderbutton"><a onClick={onFirstClick}> KODI </a></div>,
                <div className="HoverFolderbuttonSecond"><a onClick={onSecondClick}> Local </a></div>
            ]
        }
    }


    render() {
        return (
            <div
                onClick={
                    this.isThisAFile()!=true?this.props.onClick:()=>{}
                }

                data-tip={this.props.folder.name}
                className={this.isThisAFile()==true?'track track-square foldercontainer':'track track-square '}
                onContextMenu={
                    ()=>{
                        this.props.onDeleteClick()
                    }
                }
            >

                <img className={this.isThisAFile()==true?'filehover':''} src={this.isThisAFile()==true?videoImage:image}/>
                {
                    this.hoverbuttons(
                        {
                            onFirstClick:this.props.onPlayClick,
                            onSecondClick:this.props.onLocalPlayClick
                        }
                    )
                }
                <div className="ribbon">
                    <i className="fa fa-youtube"></i>
                </div>
                <div className="info">
                    <div className="track-name">{this.props.folder.name}</div>
                    <div className="track-artist">{this.props.folder.children? this.props.folder.children.length:this.props.folder.duration}</div>
                </div>

            </div>
        );
    }
}

module.exports = Folder;
