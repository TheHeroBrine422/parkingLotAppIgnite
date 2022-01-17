import './Tabs.css';
import React from "react";
import TabButton from "./TabButton";

class TabBar extends React.Component {
    constructor(props) {
        super(props)
        this.lot = this.lot.bind(this)
        this.settings = this.settings.bind(this)
        this.logout = this.logout.bind(this)
    }

    lot() {
        this.props.changePage("Lot")
    }

    settings() {
        this.props.changePage("Settings")
    }

    logout() {
        this.props.setToken("")
        this.props.changePage("Signin")
        // TODO: revokeToken
    }

    render() {
        return (
            <div className="tabs">
                <TabButton onclick={this.lot} side="left" name="Lot"/>
                <TabButton onclick={this.settings} side="left" name="Settings"/>
                <TabButton onclick={this.logout} side="right" name="Log Out"/>
            </div>
        );
    }
}

export default TabBar;
