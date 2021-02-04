import React from 'react';
import TetrisMarathon from './Game/TetrisMarathon';
import TetrisBattle from './Game/TetrisBattle';
import Register from './Register/Register';
import Homepage from './Homepage/Homepage';
import socketIOClient from 'socket.io-client';


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
        this.handleTetrisMarathonStart = this.handleTetrisMarathonStart.bind(this);
        this.handleTetrisMarathonOver = this.handleTetrisMarathonOver.bind(this);
        this.playTetrisBattleWithSomeone = this.playTetrisBattleWithSomeone.bind(this);
        this.handleTetrisBattleOver = this.handleTetrisBattleOver.bind(this);
    }

    callGetLeadersAPI() {
        fetch(process.env.REACT_APP_NODE_PROD_ENDPOINT + "/api/v1/ranks", {
            headers: {
                'Origin': 'https://www.kyothrees.com',
                // 'Origin': 'http://localhost:3000'
            },
        })
            .then(res => res.json())
            .then(data => this.setState({
                leaders: data
            }))
            .catch(error => {
                console.error(error);
                this.setState({
                    leaders: [{ name: "could", score: 100 },
                    { name: "not", score: 100 },
                    { name: "load", score: 100 },
                    { name: "scores", score: 100 },
                    { name: "garbage", score: 100 },
                    { name: "garbage", score: 100 },
                    { name: "garbage", score: 100 },
                    { name: "garbage", score: 100 },
                    { name: "garbage", score: 100 },
                    { name: "garbage", score: 100 }]
                })
            });
    }

    componentDidMount() {
        // get rankings 
        this.callGetLeadersAPI();

        // set up socket connection
        const socket = socketIOClient(process.env.REACT_APP_NODE_PROD_ENDPOINT)

        socket.on("matched", () => {
            this.handleTetrisBattleStart()
        })

        socket.on("entered waiting room", () => {
            console.log("I got put in the waiting room.")
        })

        this.setState({ socket })
    }

    // Send the request to be matched with a random player
    playTetrisBattleWithSomeone() {
        this.state.socket.emit("playTetrisBattleWithSomeone");
    }

    handleInitialGameStart() {
        console.log("game started");
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

    handleTetrisMarathonStart() {
        this.setState({
            gameState: 2
        });
    }

    handleTetrisBattleStart() {
        this.setState({
            gameState: 3
        })
    }

    handleTetrisMarathonOver(score) {
        this.setState({
            gameState: 0
        }, () => {
            fetch(process.env.REACT_APP_NODE_PROD_ENDPOINT + '/api/v1/ranks', {
                // fetch('https://kyotris.com' + '/api/v1/ranks', {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, cors, *same-origin
                    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    // credentials: 'same-origin', // include, *same-origin, omit
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://www.kyothrees.com',
                        // 'Origin': 'http://localhost:3000'
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
        })
    }

    handleTetrisBattleOver() {
        this.setState({
            gameState: 0
        })
    }

    render() {
        let screen;
        switch (this.state.gameState) {
            case 0:
                screen = <Homepage leaders={this.state.leaders} handleInitialGameStart={this.handleInitialGameStart} />
                break;
            case 1:
                screen = <Register 
                            handleNameChange={this.handleNameChange} 
                            handleTetrisMarathonStart={this.handleTetrisMarathonStart} 
                            playTetrisBattleWithSomeone={this.playTetrisBattleWithSomeone}

                            />
                break;
            case 2:
                screen = <TetrisMarathon 
                            handleTetrisMarathonOver={this.handleTetrisMarathonOver} 
                            name={this.state.name} />;
                break;
            case 3:
                screen = <TetrisBattle 
                            socket={this.state.socket}
                            name={this.state.name}
                            handleTetrisBattleOver={this.handleTetrisBattleOver} />;
                break;
            default:
                break;
        }
        return screen;
    }

}

export default Tetris;