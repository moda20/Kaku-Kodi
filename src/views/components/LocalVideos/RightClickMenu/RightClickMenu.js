import React, { Component } from 'react';
import styles from './RichClickMenu.css';


class RightClickMenu extends Component {
    constructor(props) {
        super(props);
    }



    render() {
        return (
            <div style={this.props.css}>
                <ul className={styles["custom-menu"]}>
                    <li data-action="first">First thing</li>
                    <li data-action="second">Second thing</li>
                    <li data-action="third">Third thing</li>
                </ul>
            </div>
        );
    }
}

module.exports = RightClickMenu;
