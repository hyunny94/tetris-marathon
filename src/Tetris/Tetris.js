import React from 'react';
import Game from './Game/Game';
import LeaderBoard from './LeaderBoard/LeaderBoard';

class Tetris extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            gameOn: false,

        };
        this.handleGameStateChange = this.handleGameStateChange.bind(this);
    }

    handleGameStateChange() {
        this.setState({
            gameOn: !this.state.gameOne
        })
    }

    render() {
        let leaders = [{
            name: "Hyun Kyo", score: 100
        }];

        return this.state.gameOn ? (
            <Game handleGameOver={this.handleGameStateChange} />
        ) : (<LeaderBoard leaders={leaders} handleGameStart={this.handleGameStateChange} />);
    }

}

export default Tetris;