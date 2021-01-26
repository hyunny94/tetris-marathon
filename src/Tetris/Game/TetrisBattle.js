import React from 'react';
import './game.css';
import { getCleanBoard, drawGhostPiece, releaseNextTetromino, 
         holdOrExchange, moveLeft, moveRight, rotate,
         drop, handleSpaceInput, pauseOrResume } from '../Functions';
import { PERFECT_CLEAR_GARBAGE, TWO_ROWS_CLEARED_GARBAGE, THREE_ROWS_CLEARED_GARBAGE, 
    TETRIS_GARBAGE, BTB_TETRIS_GARBAGE } from '../Constants';


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
            prevMoveDifficult: false, // True if the previous tetromino land was a tetris (4 lines cleared)
            softDropTimer: null, 
            numGarbageToBeAdded: 0, // number of garbage lines to be added when the next tet lands. 
            numClearedRow: null, // number of lines cleared by the previous tetromino landing.
        };

        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
        this.afterClearRows = this.afterClearRows.bind(this);
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
                newState = drop(this.state, undefined, this.afterClearRows);
                break;
            case 32: // space 
                newState = handleSpaceInput(this.state);
                newState = drop(newState, undefined, this.afterClearRows)
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
                    this.setState(drop(this.state, undefined, this.afterClearRows))
                }, 1000)
            }
            this.setState(pauseOrResume(this.state, softDropTimer));
        });

        // display how many seconds of pause is left
        this.props.socket.on("displayPauseSecLeft", (secLeft) => {
            console.log(secLeft, " seconds left.")
        })

        // receive lines from opponents.. 
        this.props.socket.on("addGarbageLines", (numGarbageLines) => {
            console.log("received ", numGarbageLines, " garbage lines from the opponent.");
            this.setState({numGarbageToBeAdded: this.state.numGarbageToBeAdded + numGarbageLines});
        })

        this.setState(releaseNextTetromino(this.state), 
            () => {
                this.setState({softDropTimer: setInterval(() => {
                    this.setState(drop(this.state, undefined, this.afterClearRows))
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

    beforeClearRows() {
         
    }

    afterClearRows(state) {
        // FIRST ATTACK!
        // Attack 1. Check for perfect clear 
        // (can send the opponent 10 lines if the board is completely empty!) 
        let { combo, numClearedRow, gameBoard, prevMoveDifficult } = state;
        let isBoardClean = true;
        for (let r = gameBoard.length - 1; r >= 20; r--) {
            let isRowClean = true;
            for (let c = 0; c < 10; c++) {
                if (gameBoard[r][c]['filled']) {
                    isRowClean = false;
                    isBoardClean = false;
                    break;
                }
            }
            if (!isRowClean) {
                break;
            }
        }
        if (isBoardClean) {
            console.log("Perfect Clear.")
            state = this.sendGarbageLines(state, PERFECT_CLEAR_GARBAGE);
        }
        // Attack 2. check combo
        switch (combo) {
            // Initial value
            case -1: 
            // First line clear
            case 0: 
                break
            case 1: 
            case 2: 
                console.log(combo, " combo.")
                state = this.sendGarbageLines(state, 1)
                break
            case 3:
            case 4:
                console.log(combo, " combo.")
                state = this.sendGarbageLines(state, 2)
                break
            case 5:
            case 6:
                console.log(combo, " combo.")
                state = this.sendGarbageLines(state, 3)
                break
            // combo >= 7 sends 4 lines. 
            default: 
                console.log(combo, " combo.")
                state = this.sendGarbageLines(state, 4)
                break
        }
        // Attack 3. check numClearedRow (also check Double Tetris)
        switch (numClearedRow) {
            case 2: 
                console.log("Double")
                state = this.sendGarbageLines(state, TWO_ROWS_CLEARED_GARBAGE)
                break
            case 3:
                console.log("Triple")
                state = this.sendGarbageLines(state, THREE_ROWS_CLEARED_GARBAGE)
                break
            case 4: 
                if (prevMoveDifficult) {
                    console.log("Tetris")
                    state = this.sendGarbageLines(state, BTB_TETRIS_GARBAGE)
                } else {
                    console.log("Back-to-back tetris")
                    state = this.sendGarbageLines(state, TETRIS_GARBAGE)
                }
                break
            case 0:
            case 1:
            default: 
                break
        }

        // THEN RECEIVE!
        // Receive garbage lines.. 
        state = this.addGarbageLines(state);

        return state;
    }

    /**
     * @param {*} state
     * @param {*} numGarbageLinesToSend 
     */
    sendGarbageLines(state, numGarbageLinesToSend) {
        /* Garbage countering (when a player performs a special move that sends garbage, 
        * It is first used to reduce the number of garbage lines he will receive) */
        let numGarbageToBeAdded = Math.max(state.numGarbageToBeAdded - numGarbageLinesToSend, 0);
        let linesToSend = Math.max(numGarbageLinesToSend - state.numGarbageToBeAdded, 0);
        if (linesToSend > 0) {
            this.props.socket.emit("addGarbageLines", linesToSend);
        }
        return { ...state, numGarbageToBeAdded }
    }

    // Add state.numGarbageToBeAdded of lines to the bottom of the game board 
    addGarbageLines(state) {
        let { gameBoard, numGarbageToBeAdded } = state;
        let newBoard = [];
        // Add grey lines 
        for (let i = 0; i < numGarbageToBeAdded; i++) {
            let row = [];
            for (let c = 0; c < 10; c++) {
                row.push({ filled: true, color: "#afa4a2", active: false, pivot: false, garbage: true });
            }
            newBoard.unshift(row);
        }

        // Add existing lines 
        for (let i = 39; i >= 20 + numGarbageToBeAdded; i--) {
            newBoard.unshift(gameBoard[i]);
        }

        // fill the top 
        const remainingRows = 40 - newBoard.length;
        for (let r = 0; r < remainingRows; r++) {
            let row = [];
            for (let c = 0; c < 10; c++) {
                row.push({ filled: false, color: "#2C2726", active: false, pivot: false, garbage: false });
            }
            newBoard.unshift(row);
        }

        return { ...state, gameBoard: newBoard, numGarbageToBeAdded: 0};
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