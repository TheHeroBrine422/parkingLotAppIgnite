import './Lot.css';
import React from "react";
import Popup from "reactjs-popup";
import Button from '@mui/material/Button';
import {Stack} from "@mui/material";
import axios from "axios";


class Spot extends React.Component {
    POSITION_TYPES;
    constructor(props) {
        super(props);
        this.determineClass = this.determineClass.bind(this)
        this.determineSpotButton = this.determineSpotButton.bind(this)
        this.releaseSpot = this.releaseSpot.bind(this)
        this.takeSpot = this.takeSpot.bind(this)
        this.report = this.report.bind(this)


        this.POSITION_TYPES = [
            'right center',
            'top center',
            'top right',
            'bottom center',
            'bottom right',
            'left center',
            'center center'
        ]
    }

    determineClass() {
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

    async releaseSpot() {
        let status = await axios.post("http://192.168.1.236:3001/api/v1/releaseSpot", new URLSearchParams([['sid', this.props.spot.id]]), {headers: {authorization: "Bearer "+this.props.token}}).then(function () {return "success"}).catch(function (err) {
            return err
        })
        if (status == "success") {
            this.props.getLot()
        } else {
            alert(status)
        }
    }

    async takeSpot() {
        let status = await axios.post("http://192.168.1.236:3001/api/v1/takeSpot", new URLSearchParams([['sid', this.props.spot.id]]), {headers: {authorization: "Bearer "+this.props.token}}).then(function () {return "success"}).catch(function (err) {
            return err
        })
        if (status == "success") {
            this.props.getLot()
        } else {
            alert(status)
        }
    }

    report() { // TODO
        alert("Sorry this isn't implemented yet.")
    }

    determineSpotButton() {
        if (this.props.spot.current_email === this.props.user.email && this.props.spot.inuse) {
            return (<Button variant="contained" disableRipple onClick={this.releaseSpot}>Release</Button>)
        } else if (this.props.spot.inuse) {
            return (<Button variant="border" disableRipple style={{cursor: "not-allowed", "text-decoration":"line-through"}}>Take</Button>)
        } else {
            return (<Button disableRipple variant="contained" onClick={this.takeSpot}>Take</Button>)
        }
    }

    render() {
        let currentUser = {name: "None", license_plate: "None"};

        for (let i = 0; i < this.props.users.length; i++) {
            if (this.props.users[i].email === this.props.spot.current_email) {
                currentUser = this.props.users[i]
                break
            }
        }

        return (<Popup position={this.POSITION_TYPES} closeOnDocumentClick on="click" trigger={this.determineClass}>
            <p>Spot: {this.props.spot.number+" "+this.props.spot.section}</p>
            {/*  <p>Currently {this.props.spot.inuse ? "Taken" : "Free"}</p> */}
            <p>Current Owner: {currentUser.name}</p>
            <p>Current License Plate: {currentUser.license_plate}</p>
            <Stack direction="row" spacing={1}>
                {this.determineSpotButton()}
                <Button variant="contained" disableRipple onClick={this.report} color="error">Report</Button>
            </Stack>
        </Popup>)
    }
}

export default Spot;
