import './Lot.css';
import React from "react";
import axios from "axios";
import Spot from './Spot'

class Lot extends React.Component {
    constructor(props) {
        super(props)
        this.getLot = this.getLot.bind(this)
        this.getLot()
    }

    async getLot() {
        let URLParams = new URLSearchParams();
        let lot = "fail"
        while (lot === "fail") {
            lot = await axios.get("http://localhost:3001/api/v1/getLot", {
                params: URLParams,
                headers: {authorization: "Bearer " + this.props.token}
            })
                .then(function (res) {
                    return res.data
                })
                .catch(function (error) {
                    return "fail"
                });
        }
        this.setState({lot: lot})
    }
    render() {
        if (this.state != null) {
            return (
                <div className="lot">
                    {this.state.lot.spots.map(spot => (<Spot spot={spot} />))}
                </div>
            );
        } else {
            return (
                <div className="lot">
                    <p>Loading...</p>
                </div>
            );
        }
    }
}

export default Lot;
