import './Signin.css';
import GoogleLogin from 'react-google-login';
import React from "react";

class Signin extends React.Component {
    render() {
        return (
            <div className="signin">
                <h3>Sign in to Parking Lot</h3>
                <GoogleLogin
                    className="google-sign-in"
                    clientId="715235332986-6cap51nr2g8ovtqdetbl0c04hn6upbhb.apps.googleusercontent.com"
                    onSuccess={this.props.signin}
                    onFailure={console.log}
                    cookiePolicy={'single_host_origin'}
                />
        </div>
        );
    }
}

export default Signin;
