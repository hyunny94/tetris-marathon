import React from 'react';
import Game from './Game/Game';
import LeaderBoard from './LeaderBoard/LeaderBoard';
import Register from './Register/Register';
import Help from './Help/Help';


class Tetris extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            gameState: 0,
            name: null,
            apiResponse: "",
            leaders: [],
        };
        this.handleInitialGameStart = this.handleInitialGameStart.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleGameStart = this.handleGameStart.bind(this);
        this.handleGameOver = this.handleGameOver.bind(this);
    }

    callGetLeadersAPI() {
        console.log("calling the following endpoint:");
        // console.log(process.env.REACT_APP_SERVER_HOST + "/api/v1/ranks");
        // fetch(process.env.REACT_APP_SERVER_HOST + "/api/v1/ranks")
        console.log('https://kyotris.com' + "/api/v1/ranks");
        fetch('https://kyotris.com' + "/api/v1/ranks", {
            headers: {
                'Origin': 'https://www.kyothrees.com',
            },
        })
            .then(res => res.json())
            .then(data => this.setState({
                leaders: data
            }))
    }

    componentDidMount() {
        this.callGetLeadersAPI();
    }

    handleInitialGameStart() {
        console.log("initial game start!");
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

    handleRegister() {
        console.log('a new user has registered!');
        this.setState({
            gameState: 2,
        });
    }

    handleGameStart() {
        console.log('a game has started');
        this.setState({
            gameState: 3
        });
    }

    handleGameOver(score) {
        console.log('game over');
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
                console.log(data);
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
                screen = <LeaderBoard leaders={this.state.leaders} handleInitialGameStart={this.handleInitialGameStart} />
                break;
            case 1:
                screen = <Register handleNameChange={this.handleNameChange} handleRegister={this.handleRegister} />
                break;
            case 2:
                screen = <Help handleGameStart={this.handleGameStart} />
                break;
            case 3:
                screen = <Game handleGameOver={this.handleGameOver} />;
                break;
            default:
                break;
        }
        return screen;
    }

}

export default Tetris;