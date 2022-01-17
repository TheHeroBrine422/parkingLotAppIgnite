import './Lot.css';
import React from "react";
import axios from "axios";
import Spot from './Spot'

class Lot extends React.Component {
    constructor(props) {
        super(props)
        this.getLot = this.getLot.bind(this)
        this.state = {
            lot: {spots: [], users: []}
        }
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
        return (
            <div>
                <text>Green is free, red is inuse, white is free and you are owner, cyan is inuse and you are owner, and black is your current spot</text>
            <div className="lot">
                {this.state.lot.spots.map(spot => (<Spot spot={spot} user={this.props.user}/>))}
            </div>
            </div>
        );
    }
}

export default Lot;
