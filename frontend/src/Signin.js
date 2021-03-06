import './Signin.css';
import GoogleLogin from 'react-google-login';
import React from "react";
import axios from "axios";

class Signin extends React.Component {
    constructor(props) {
        super();
        this.signin = this.signin.bind(this)
    }

    async signin(res) {
        let URLParams = new URLSearchParams();
        URLParams.append("credential", res.tokenId)
        let token = await axios.post(process.env.REACT_APP_API_URL+"/api/v1/getTokenGoogle", URLParams)
            .then(function (res) {
                return res.data
            })
            .catch(function (error) {
                return error
            })
        if (token.response === undefined) {
            this.props.setToken(token)
            this.props.changePage("Lot")
        } else if (token.response.status === 400 && token.response.data.err === 109) {
            alert("Invalid Google Account.")
        } else {
            setTimeout(this.signin,1000, res)
        }
    }

    render() {
        return (
            <div className="signin">
                <h3>Sign in to Parking Lot</h3>
                <GoogleLogin
                    className="google-sign-in"
                    clientId="715235332986-6cap51nr2g8ovtqdetbl0c04hn6upbhb.apps.googleusercontent.com"
                    onSuccess={this.signin}
                    onFailure={console.log}
                    cookiePolicy={'single_host_origin'}
                />
        </div>
        );
    }
}

export default Signin;
