import './Settings.css'
import React from "react";

class Settings extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="settings"><text>Settings!</text><text>{JSON.stringify(this.props.user)}</text></div>

        )

    }
}

export default Settings;
