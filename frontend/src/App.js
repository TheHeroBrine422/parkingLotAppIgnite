import React from "react";
import axios from "axios";
import Signin from "./Signin";
import Main from "./Main"

class App extends React.Component {
    constructor(props) {
        super(props);
        if (localStorage.getItem("token") == null) {
            this.state = {token: "", page: "Signin"}
        } else {
            this.state = {token: localStorage.getItem("token"), page: "Main"}
            this.checkValidToken()
        }

        this.signin = this.signin.bind(this)
        this.checkValidToken = this.checkValidToken.bind(this)
    }

    async signin(res) {
        let URLParams = new URLSearchParams();
        URLParams.append("credential", res.tokenId)
        let token = await axios.post("http://localhost:3001/api/v1/getTokenGoogle", URLParams)
            .then(function (res) {
                return res.data
            })
            .catch(function (error) {
                return "fail"
            })
        if (token !== "fail") {
            this.setState({token: token, page: "Main"})
            localStorage.setItem("token", token)
        } else {
            await this.signin(res)
        }
    }

    async checkValidToken() {
        let status = await axios.get("http://localhost:3001/api/v1/getLot", {
            headers: {authorization: "Bearer " + this.state.token}
        })
            .then(function (res) {
                return "pass"
            })
            .catch(function (error) {
                if (error.response != null && error.response.status == 401) {
                    return "badToken"
                } else {
                    return "failedReq"
                }
            });
        if (status === "failedReq") {
            this.checkValidToken()
        } else if (status === "badToken") {
            this.setState({token: "", page: "Signin"})
        }
    }

    render() {
        if (this.state.page === "Signin") {
            return (
                <Signin signin={this.signin}/>
            );
        } else if (this.state.page === "Main") {
            return (
                <Main token={this.state.token}/>
            );
        } else {
            return (<p>Something went horribly wrong.</p>)
        }
    }
}

export default App;
