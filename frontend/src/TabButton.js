import './Tabs.css';
import React from "react";

class TabButton extends React.Component {

    render() {
        if (this.props.side === "right") {
            return (
                <button className="tabButtonRight" onClick={this.props.onclick}>{this.props.name}</button>
            )
        } else {
            return (
                <button className="tabButtonLeft" onClick={this.props.onclick}>{this.props.name}</button>
            );
        }

    }
}

export default TabButton;
