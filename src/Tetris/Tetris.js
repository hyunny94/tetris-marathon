import React from 'react';
import Game from './Game/Game';
import Register from './Register/Register';
import Homepage from './Homepage/Homepage';
import socketIOClient from "socket.io-client";

class Tetris extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            gameState: 0,
            name: null,
            apiResponse: "",
            leaders: [],
            socket: null,
        };
        this.handleInitialGameStart = this.handleInitialGameStart.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleGameStart = this.handleGameStart.bind(this);
        this.handleGameOver = this.handleGameOver.bind(this);
    }

    callGetLeadersAPI() {
        fetch('https://kyotris.com' + "/api/v1/ranks", {
            headers: {
                'Origin': 'https://www.kyothrees.com',
            },
        })
            .then(res => res.json())
            .then(data => this.setState({
                leaders: data
            }))
            .catch(error => {
                console.error(error);
                this.setState({
                    leaders: [{ name: "dummy", score: 100 },
                    { name: "dummy", score: 100 },
                    { name: "dummy", score: 100 },
                    { name: "dummy", score: 100 },
                    { name: "dummy", score: 100 },
                    { name: "dummy", score: 100 },
                    { name: "dummy", score: 100 },
                    { name: "dummy", score: 100 },
                    { name: "dummy", score: 100 },
                    { name: "dummy", score: 100 }]
                })
            });
    }

    componentDidMount() {
        this.callGetLeadersAPI();
    }

    handleInitialGameStart() {
        this.setState({
            gameState: 1
        });
    }

    handleNameChange(e) {
        const name = e.target.value;
        this.setState({
            name
        });
    }

    handleGameStart() {
        const socket = socketIOClient("127.0.0.1:9000");
        this.setState({
            socket: socket
        });
        socket.on("game start", _ => {
            console.log("game start sign.")
            this.setState({
                gameState: 2
            });
        });
        socket.on("opponent left", _ => {
            console.log("opponent left sign.")
            this.setState({gameState: 0})
        });
    }

    handleGameOver(score) {
        // fetch(process.env.REACT_APP_SERVER_HOST + '/api/v1/ranks', {
        fetch('https://kyotris.com' + '/api/v1/ranks', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            // credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://www.kyothrees.com',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify({ name: this.state.name, score: score }), // body data type must match "Content-Type" header
        })
            .then(data => {
                this.callGetLeadersAPI();
                this.setState({
                    gameState: 0
                })
            })
            .catch(error => {
                console.error(error);
                this.setState({
                    gameState: 0
                })
            });
    }

    render() {
        let screen;
        switch (this.state.gameState) {
            case 0:
                screen = <Homepage leaders={this.state.leaders} handleInitialGameStart={this.handleInitialGameStart} />
                break;
            case 1:
                screen = <Register handleNameChange={this.handleNameChange} handleGameStart={this.handleGameStart} />
                break;
            case 2:
                screen = <Game handleGameOver={this.handleGameOver} socket={this.state.socket}/>;
                break;
            default:
                break;
        }
        return screen;
    }

}

export default Tetris;