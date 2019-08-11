import React, { Component } from 'react';
import image from '../../../public/images/folder-icon.png';
import videoImage from '../../../public/images/video-icon.png';


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



    render() {
        return (
            <div
                onClick={
                    this.isThisAFile()==true?this.props.onPlayClick:this.props.onClick
                }

                data-tip={this.props.folder.name}
                className="track track-square"
                onContextMenu={
                    ()=>{
                        this.props.onDeleteClick();
                    }
                }
            >

                <img src={this.isThisAFile()==true?videoImage:image}/>
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
