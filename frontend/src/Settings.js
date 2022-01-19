import './Settings.css'
import React from "react";
import axios from "axios";

class Settings extends React.Component {
    roleLookup;
    constructor(props) {
        super(props)
        this.state = {licensePlate: this.props.user.license_plate, section: this.props.user.section, err: ""}
        this.roleLookup = {0: "Student", 1: "Teacher", 2: "Administrator", 3: "Developer"}

        this.handleChangeLicensePlate = this.handleChangeLicensePlate.bind(this)
        this.handleChangeSection = this.handleChangeSection.bind(this)
        this.confirmButton = this.confirmButton.bind(this)
    }

    handleChangeLicensePlate(e) {
        this.setState({licensePlate: e.target.value.toUpperCase(), section: this.state.section, err: this.state.err})
    }

    handleChangeSection(e) {
        this.setState({licensePlate: this.state.licensePlate, section: e.target.value, err: this.state.err})
    }

    async confirmButton(e) {
        this.setState({licensePlate: this.state.licensePlate, section: this.state.section, err: ""})

        let errLP
        let errSection

        if (this.state.licensePlate !== this.props.user.license_plate) {
            errLP = await axios.post(process.env.REACT_APP_API_URL+"/api/v1/setLicensePlate", new URLSearchParams([['license_plate', this.state.licensePlate]]), {headers: {authorization: "Bearer "+this.props.token}}).then(() => {this.props.changePage("Settings")}).catch(function (err) {
                return err
            })
        }

        if (errLP !== undefined) {
            if (errLP.response !== undefined && errLP.response.data !== undefined) {
                if (errLP.response.data.err === 101) {
                    this.setState({licensePlate: this.state.licensePlate, section: this.state.section, err: "Invalid License Plate"})
                } else {
                    this.setState({licensePlate: this.state.licensePlate, section: this.state.section, err: "Unknown Error "+JSON.stringify(errLP.response.data)})
                }
            } else {
                this.setState({licensePlate: this.state.licensePlate, section: this.state.section, err: "Something went wrong. "+JSON.stringify(errLP)})
            }
        }

        if (this.state.section !== this.props.user.section) {
            errSection = await axios.post(process.env.REACT_APP_API_URL+"/api/v1/setSection", new URLSearchParams([['section', this.state.section]]), {headers: {authorization: "Bearer "+this.props.token}}).then(() => {this.props.changePage("Settings")}).catch(function (err){
                return err
            })
        }

        if (errSection !== undefined) {
            let errSectionString
            if (errSection.response !== undefined && errSection.response.data !== undefined) {
                errSectionString = "Unknown Error. "+JSON.stringify(errSection.response.data)
            } else {
                errSectionString = "Something went wrong. "+JSON.stringify(errSection)
            }
            if (this.state.err !== "") {
                this.setState({licensePlate: this.state.licensePlate, section: this.state.section, err: this.state.err+" "+errSectionString})
            } else {
                this.setState({licensePlate: this.state.licensePlate, section: this.state.section, err: errSectionString})
            }
        }
    }
    render() {
        return (
            <div className="settings">
                <h1>Account Information</h1>
                <p>Name: {this.props.user.name}</p>
                <p>Email: {this.props.user.email}</p>
                <p>Role: {this.roleLookup[this.props.user.access]}</p>
                <p>License Plate: <input type="text" value={this.state.licensePlate} onChange={this.handleChangeLicensePlate}/></p>
                <p>Section: <select value={this.state.section} onChange={this.handleChangeSection}>
                    <option value='AM'>AM</option>
                    <option value='PM'>PM</option>
                </select></p>
                <button type="button" onClick={this.confirmButton}>Confirm Changes</button>
                <p style={{color:"red"}}>{this.state.err}</p>
            </div>

        )

    }
}

export default Settings;
