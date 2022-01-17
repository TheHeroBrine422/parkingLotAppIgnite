import './Spot.css';
import React from "react";

class Spot extends React.Component {
    render() {
        if (this.props.user.section === this.props.spot.section) {
            if (this.props.spot.current_email === this.props.user.email && this.props.spot.inuse) {
                return (
                    <text className="spot current">{this.props.spot.number}</text>
                );
            }
            if (this.props.spot.owner_email === this.props.user.email) {
                if (this.props.spot.inuse) {
                    return (
                        <text className="spot inuse-owned">{this.props.spot.number}</text>
                    );
                } else {
                    return (
                        <text className="spot free-owned">{this.props.spot.number}</text>
                    );
                }
            } else {
                if (this.props.spot.inuse) {
                    return (
                        <text className="spot inuse">{this.props.spot.number}</text>
                    );
                } else {
                    return (
                        <text className="spot free">{this.props.spot.number}</text>
                    );
                }
            }
        } else {
            return (<div/>);
        }
    }
}

export default Spot;
