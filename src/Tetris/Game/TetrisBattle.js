import React from 'react';
import './game.css';
import { getCleanBoard, drawGhostPiece, releaseNextTetromino, 
         holdOrExchange, moveLeft, moveRight, rotate,
         drop, handleSpaceInput, pauseOrResume } from '../Functions';


/** Tetris Battle Game mode is playered by two players going against each other. 
 *  The rule is described below.
 *  - Winner is determined by these factors in order (KO, lines sent)
 *  - If both the # of KOs and the lines sent are equal, it's a draw.
 * 
 *  TODO
 *  Front-end
 *  1. should display 2 boards (opponent's view as well)
 *  2. should keep a count of KOs and lines sent to the opponent
 *  3. should display remaining time starting from 2 minutes
 *  4.
 *  
 *  Game-logic
 *  1. when a tetromino reaches the ceiling, 
 *     it should clear the board and count as a KO for the opponent.
 *  2. certain line-clearing actions sends attacking lines to the opponent. 
 *  3. 
 * */ 
class TetrisBattle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            combo: -1,
            isPaused: false,
            gameBoard: getCleanBoard(),
            active: [
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false }
            ],
            activeBlockType: null,
            activeBlockOrientation: 0,
            heldBlock: null,
            holdUsed: false,
            nextTetType: Math.floor(Math.random() * 7),
            prevMoveDifficult: false, // currently tetris (4 line clears) is the only difficult move there is.
            softDropTimer: null
        };

        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
    }

    handleKeyboardInput(event) {
        event.preventDefault();

        // "p" for pausing OR resuming the game
        if (event.keyCode === 80) {
            this.props.socket.emit("pauseOrResume");
            return;
        }
        
        // if the game is paused the following keys do not have any effects.
        if (this.state.isPaused) {
            return;
        }

        let newState = this.state;
        switch (event.keyCode) {
            case 16: // "shift" for holding a piece OR exchanging with held piece
                newState = holdOrExchange(this.state);
                break;
            case 37: // left arrow
                newState = moveLeft(this.state);
                break;
            case 38: // up arrow
                newState = rotate(this.state);
                break;
            case 39: // right arrow
                newState = moveRight(this.state);
                break;
            case 40: // down arrow
                newState = drop(this.state);
                break;
            case 32: // space 
                newState = handleSpaceInput(this.state);
                newState = drop(newState)
                break;
            default:
                break;
        }
        this.setState(newState);
    }

    componentDidMount() {
        // set up game-related socket 
        this.props.socket.on("pauseOrResume", () => {
            let softDropTimer = null 
            if (this.state.isPaused) {
                softDropTimer = setInterval(() => {
                    this.setState(drop(this.state))
                }, 1000)
            }
            this.setState(pauseOrResume(this.state, softDropTimer));
        });

        // display how many seconds of pause is left
        this.props.socket.on("displayPauseSecLeft", (secLeft) => {
            console.log(secLeft, " seconds left.")
        })

        this.setState(releaseNextTetromino(this.state), 
            () => {
                this.setState({softDropTimer: setInterval(() => {
                    this.setState(drop(this.state))
                }, 1000)}, () => {
                    document.addEventListener("keydown", this.handleKeyboardInput, false);
                })
            }
        );
    }

    componentWillUnmount() {
        clearInterval(this.state.softDropTimer);
        document.removeEventListener("keydown", this.handleKeyboardInput, false);
    }

    render() {
        return (
            <div className="gameContainer">
                <div className="gameBoard">
                    {drawGhostPiece(this.state)}
                </div>
            </div>
        );
    }

}

export default TetrisBattle;