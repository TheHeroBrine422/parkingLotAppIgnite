import './Spot.css';
import React from "react";

class Spot extends React.Component {
    render() {
        return (
            <div className="spot">
                <text>{JSON.stringify(this.props.spot)}</text>
            </div>
        );
    }
}

export default Spot;
