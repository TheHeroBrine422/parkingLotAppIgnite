import React from "react";
import axios from "axios";
import Signin from "./Signin";
import Lot from "./Lot"
import TabBar from "./TabBar";
import Settings from "./Settings";

class App extends React.Component {
    constructor(props) {
        super(props);
        if (localStorage.getItem("token") == null) {
            this.state = {token: "", page: "Signin", user: {}}
        } else {
            this.state = {token: localStorage.getItem("token"), page: "Lot", user: {}}
            this.getUser()
        }

        this.getUser = this.getUser.bind(this)
        this.changePage = this.changePage.bind(this)
        this.setToken = this.setToken.bind(this)
    }

    changePage(page) {
        if (page !== this.state.page) {
            this.setState({token: this.state.token, page: page, user: this.state.user})
        }
        this.getUser()
    }

    setToken(token) {
        this.setState({token: token, page: this.state.page, user: this.state.user})
        localStorage.setItem("token", token)
        this.getUser()
    }

    async getUser() { // also checks if token is valid. Ran anytime the page is changed. TODO: refresh token?
        let user = await axios.get(process.env.REACT_APP_API_URL+"/api/v1/getSelf", {
            headers: {authorization: "Bearer " + this.state.token}
        })
            .then(function (res) {
                return res.data
            })
            .catch(function (error) {
                return error
            });
        if (user.email === undefined) {
            if (user.response != null) {
                this.setState({token: "", page: "Signin", user: {}})
            } else {
                setTimeout(this.getUser, 1000) // dont loop too fast. Potenial DOS attack.
            }
        } else {
            this.setState({token: this.state.token, page: this.state.page, user: user})
        }
    }

    render() {
        switch (this.state.page) {
            case "Signin":
                return (
                    <Signin changePage={this.changePage} setToken={this.setToken}/>
                );
            case "Lot":
                return (
                    <div>
                        <TabBar token={this.state.token} changePage={this.changePage} setToken={this.setToken} user={this.state.user}/>
                        <Lot token={this.state.token} changePage={this.changePage} user={this.state.user}/>
                    </div>
                );
            case "Settings":
                return (
                    <div>
                        <TabBar token={this.state.token} changePage={this.changePage} setToken={this.setToken} user={this.state.user}/>
                        <Settings token={this.state.token} changePage={this.changePage} user={this.state.user}/>
                    </div>
                )
            default:
                this.setState({token: this.state.token, page: "Lot"})
                return (
                    <p>Something has went wrong. Trying to fix.</p>
                )

        }
    }
}

export default App;
