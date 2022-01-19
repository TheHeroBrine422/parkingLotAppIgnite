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
        setInterval(this.getLot, 1000)
    }

    async getLot() {
        let URLParams = new URLSearchParams();
        let lot = "fail"
        lot = await axios.get(process.env.REACT_APP_API_URL+"/api/v1/getLot", {
            params: URLParams,
            headers: {authorization: "Bearer " + this.props.token}
        })
            .then(function (res) {
                return res.data
            })
        if (lot !== "fail") {
            lot.spots.sort(function (a, b) {
                return Number(a.number) - Number(b.number)
            })
            this.setState({lot: lot})
        }
    }
    render() {
        return (
            <div>
                <text className="free-text">Green is free. </text>
                <text className="inuse-text">Red is in use. </text>
                <text className="free-owned-text">White is free and your assigned spot. </text>
                <text className="inuse-owned-text">Cyan is in use and your assigned spot. </text>
                <text className="current-text">Black is your current spot.</text>
            <div className="lot">
                {this.state.lot.spots.map(spot => (<Spot spot={spot} users={this.state.lot.users} user={this.props.user} token={this.props.token} getLot={this.getLot}/>))}
            </div>
            </div>
        );
    }
}

export default Lot;
