import './Spot.css';
import React from "react";

class Spot extends React.Component {
    render() {
        return (
            <div className="spot">
                <p>{JSON.stringify(this.props.spot)}</p>
            </div>
        );
    }
}

export default Spot;
