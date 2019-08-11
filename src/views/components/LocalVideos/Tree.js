import React, { Component } from 'react';
import image from '../../../public/images/folder-icon.png';
import Folder from "./Folder";

class Tree extends Component {
    constructor(props) {
        super(props);
    }



    render() {


        return (
            <div
                /*data-tip={this.props.track.title}
                className={this.props.trackClassName}
                onClick={this.props.onClick}
                onContextMenu={this.props.onContextMenu}*/>
                {this.props.tree}
                <img src={image}/>
                <Folder name={}>

                </Folder>


                <div className="ribbon">
                    <i className={this.props.iconClassName}></i>
                </div>
                <div className="info">
                    <div className="track-name">{this.props.track.title}</div>
                    <div className="track-artist">{this.props.track.artist}</div>
                </div>
                <div className="top-droppable folder-content easeout2 closed" id="folder4-content">
                    <div className="close-folder-content"><i className="fa fa-times" aria-hidden="true"></i></div>
                    <h2><i className="fa fa-folder" aria-hidden="true"></i><span>Folder 4</span></h2>
                </div>
            </div>


        );
    }
}

module.exports = Tree;
