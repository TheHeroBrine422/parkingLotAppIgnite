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
            this.state = {token: "", page: "Signin"}
        } else {
            this.state = {token: localStorage.getItem("token"), page: "Lot"}
            this.checkValidToken()
        }

        this.checkValidToken = this.checkValidToken.bind(this)
        this.changePage = this.changePage.bind(this)
        this.setToken = this.setToken.bind(this)
    }

    changePage(page) {
        if (page !== this.state.page) {
            this.setState({token: this.state.token, page: page})
        }
    }

    setToken(token) {
        this.setState({token: token, page: this.state.page})
        localStorage.setItem("token", token)
    }

    async checkValidToken() {
        let status = await axios.get("http://localhost:3001/api/v1/getLot", {
            headers: {authorization: "Bearer " + this.state.token}
        })
            .then(function (res) {
                return "pass"
            })
            .catch(function (error) {
                if (error.response != null && error.response.status === 401) {
                    return "badToken"
                } else {
                    return "failedReq"
                }
            });
        if (status === "failedReq") {
            this.checkValidToken()
        } else if (status === "badToken") {
            this.setState({token: "", page: "Signin"})
        } else {
            this.setState({token: this.state.token, page: "Lot"})
        }
    }

    render() {
        switch (this.state.page) {
            case "Signin":
                return (
                    <Signin signin={this.signin} changePage={this.changePage} setToken={this.setToken}/>
                );
            case "Lot":
                return (
                    <div>
                        <TabBar token={this.state.token} changePage={this.changePage} setToken={this.setToken}/>
                        <Lot token={this.state.token} changePage={this.changePage}/>
                    </div>
                );
            case "Settings":
                return (
                    <div>
                        <TabBar token={this.state.token} changePage={this.changePage} setToken={this.setToken}/>
                        <Settings token={this.state.token} changePage={this.changePage}/>
                    </div>
                )
            default:
                this.setState({token: this.state.token, page: "Signin"})
                return (
                    <p>Something has went wrong. Trying to fix.</p>
                )

        }
    }
}

export default App;
