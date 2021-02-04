import React from 'react';
import SingleTetBoard from './Components/SingleTetBoard';
import './game.css';
import { getCleanBoard, drawGhostPiece, ghostPiece, ghostColor, 
         releaseNextTetromino, holdOrExchange, moveLeft, moveRight, 
         rotate, drop, handleSpaceInput, pauseOrResume, 
         tetrominoTypeToColor, tetrominoTypeToNextPos, checkGameOver } from '../Functions';
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
            ko: 0, // number of times I KOed the opponent
            totalLinesSent: 0, // number of lines sent to the opponent
            timeLeftInSec: 120, // time left in the game. 
            resultText: null, // final game result (set after the game is over) [YOU WIN!, YOU LOSE!, DRAW!]
            /* Below are OPPONENT's state */
            oppGameBoard: getCleanBoard(),
            oppActive: [
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false }
            ],
            oppKo: 0, // number of times I got KOed by the opponent
            oppTotalLinesSent: 0, // number of lines sent by the opponent 
            oppNextTetType: null, // next tetromino type for the opponent
            oppHeldBlock: null, // Tet held by the opponent
            oppName: null, // Opponent's name
            oppResultText: null, // final game result (set after the game is over) [YOU WIN!, YOU LOSE!, DRAW!]
        };

        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
        this.beforeClearRows = this.beforeClearRows.bind(this);
        this.afterClearRows = this.afterClearRows.bind(this);
        this.gameOverHandler = this.gameOverHandler.bind(this);
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
                this.props.socket.emit("heldBlockChange", newState.heldBlock);
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
                newState = drop(this.state, this.beforeClearRows, this.afterClearRows, this.gameOverHandler);
                break;
            case 32: // space 
                newState = handleSpaceInput(this.state);
                newState = drop(newState, this.beforeClearRows, this.afterClearRows, this.gameOverHandler)
                break;
            default:
                break;
        }
        this.setState(newState);
        this.props.socket.emit("boardChange", newState.gameBoard, newState.active, newState.nextTetType)
    }

    componentDidMount() {
        let { socket, name, handleTetrisBattleOver } = this.props;

        // set up game-related socket 
        socket.on("pauseOrResume", () => {
            let softDropTimer = null 
            if (this.state.isPaused) {
                softDropTimer = setInterval(() => {
                    let newState = drop(this.state, this.beforeClearRows, this.afterClearRows, this.gameOverHandler);
                    this.setState(newState)
                    socket.emit("boardChange", newState.gameBoard, newState.active, newState.nextTetType)
                }, 1000)
            }
            this.setState(pauseOrResume(this.state, softDropTimer));
        });

        // display how many seconds of pause is left
        socket.on("displayPauseSecLeft", (secLeft) => {
            console.log(secLeft, " seconds left.")
        })

        // receive lines from opponents.. 
        socket.on("addGarbageLines", (numGarbageLines) => {
            console.log("received ", numGarbageLines, " garbage lines from the opponent.");
            this.setState({numGarbageToBeAdded: this.state.numGarbageToBeAdded + numGarbageLines});
        })

        // receive oppGameBoard, and oppActive update 
        socket.on("boardChange", (oppGameBoard, oppActive, oppNextTetType) => {
            this.setState({ oppGameBoard, oppActive, oppNextTetType })
        })

        // opponent used hold feature
        socket.on("heldBlockChange", (oppHeldBlock) => {
            this.setState({ oppHeldBlock })
        })

        // opponent was KOed.
        socket.on("KOed", () => {
            this.setState({ ko: this.state.ko + 1 })
        })

        // opponent's totalLinesSent changed.
        socket.on("linesSentChanged", (oppTotalLinesSent) => {
            this.setState({ oppTotalLinesSent })
        })

        // opponent is telling me his name.
        socket.on("myNameIs", (oppName) => {
            this.setState({ oppName })
        });

        // server is telling us how many seconds are left in the game
        socket.on("timeUpdate", () => {
            this.setState({ timeLeftInSec: this.state.timeLeftInSec - 1 })
        })

        // Game is over
        socket.on("game over", () => {
            let result = this.didIWinDrawLose(this.state);
            console.log("result is: ", result)
            let resultText;
            let oppResultText;
            if (result === 1) {
                resultText = "YOU WIN!"
                oppResultText = "YOU LOSE!"
            } else if (result === 2) {
                resultText = "DRAW!"
                oppResultText = "DRAW!"
            } else if (result === 3) {
                resultText = "YOU LOSE!"
                oppResultText = "YOU WIN!"
            } else {
                resultText = "ERROR!"
                oppResultText = "ERROR!"
            }
            this.setState({ resultText, oppResultText }, () => {
                // disable user input
                document.removeEventListener("keydown", this.handleKeyboardInput, false); 
                // stop drop interval
                clearInterval(this.state.softDropTimer);
                // this brings the screen back to the main page.
                setTimeout(() => {
                    handleTetrisBattleOver()
                }, 5000)
            })
        })

        // Tell the opponent my name.
        socket.emit("myNameIs", name)
        let newState = releaseNextTetromino(this.state) 
        this.setState(newState, 
            () => {
                socket.emit("boardChange", newState.gameBoard, newState.active, newState.nextTetType)
                this.setState({softDropTimer: setInterval(() => {
                    let newState = drop(this.state, this.beforeClearRows, this.afterClearRows, this.gameOverHandler);
                    this.setState(newState)
                    socket.emit("boardChange", newState.gameBoard, newState.active, newState.nextTetType)
                }, 1000)}, () => {
                    document.addEventListener("keydown", this.handleKeyboardInput, false);
                })
            }
        );
    }

    // TODO: this should be renamed to gameBoardFullHandler or sth, because full gameboard doesn't
    // necessarily mean the game is over. 
    gameOverHandler(state) {
        // I am KOed. Tell the opponent. 
        console.log("I am KOed.")
        this.props.socket.emit("KOed");
        // Since I am KOed, the opponent's KO count gets incremented.
        state = { ...state, oppKo: state.oppKo + 1 }
        // clean the board. 
        state = {...state, gameBoard: getCleanBoard(), active: [
            { row: -1, col: -1, pivot: false },
            { row: -1, col: -1, pivot: false },
            { row: -1, col: -1, pivot: false },
            { row: -1, col: -1, pivot: false }
        ],
        activeBlockType: null,
        activeBlockOrientation: 0};
        // release next tetromino 
        state = releaseNextTetromino(state)
        return state;
    }

    /**
     * Return 1 if i won, 2 if drew, 3 if lost.
     * First check # of KOs and then # of lines sent. 
     * If both are equal, lastly check the highest row with any of its columns filled. 
     * (NOTE: lower row number is higher on the gameboard.)
     * If all are equal then the result is a draw. 
     * @param {*} state 
     */
    didIWinDrawLose(state) {
        let { ko, oppKo, totalLinesSent, oppTotalLinesSent, gameBoard, oppGameBoard } = state;
        if (ko === oppKo) {
            if (totalLinesSent === oppTotalLinesSent) {
                let highestRow = this.getHighestFilledRow(gameBoard);
                let oppHighestRow = this.getHighestFilledRow(oppGameBoard);
                if (highestRow === oppHighestRow) {
                    return 2;
                } else if (highestRow < oppHighestRow) {
                     return 3;
                } else {
                    return 1;
                }
            } else if (totalLinesSent > oppTotalLinesSent) {
                return 1;
            } else {
                return 3;
            }
        } else if (ko > oppKo) {
            return 1;
        } else {
            return 3;
        }
    }

    /**
     * Return the row number of the highest row with any of its columns filled.
     * @param {*} state 
     */
    getHighestFilledRow(gameBoard) {
        for (let r = 20; r < gameBoard.length; r++) {
            for (let c = 0; c < 10; c++) {
                if (!gameBoard[r][c].active && gameBoard[r][c].filled) return r;    
            }
        }
        return 41;
    }

    beforeClearRows(state) {
         return state;
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
            this.props.socket.emit("linesSentChanged", state.totalLinesSent + linesToSend)
        }
        return { ...state, numGarbageToBeAdded, totalLinesSent: state.totalLinesSent + linesToSend }
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
        let { gameBoard, active, oppGameBoard, oppActive, 
            ko, oppKo, totalLinesSent, oppTotalLinesSent, 
            nextTetType, oppNextTetType, heldBlock, oppHeldBlock, oppName,
            timeLeftInSec, resultText, oppResultText } = this.state;
        let { name } = this.props;
        let myBoard = drawGhostPiece(gameBoard, ghostPiece(gameBoard, active), ghostColor(gameBoard, active));
        let oppBoard = drawGhostPiece(oppGameBoard, ghostPiece(oppGameBoard, oppActive), ghostColor(oppGameBoard, oppActive)) 
        let min = Math.floor(timeLeftInSec / 60);
        // turn minute into text format
        switch (min) {
            case 0:
                min = "00"
                break
            case 1:
                min = "01"
                break
            case 2:
                min = "02"
                break
            default:
                break
        }
        let sec = timeLeftInSec % 60;
        // turn second into text format
        if (sec < 10) {
            sec = "0" + sec
        }

        return (
            <div className="gameContainer">
                {/* Top status board */}
                <div className="topBoard">
                    <h3 style={{display: "inline-block", 
                    width: "330px", height: "100px"}}> {name} </h3>
                    <h3 style={{display: "inline-block", 
                    width: "330px", height: "100px", whiteSpace: "pre-line"}}> TIME {"\n"} {min}:{sec} </h3>
                    <h3 style={{display: "inline-block", 
                    width: "330px", height: "100px"}}> {oppName} </h3>
                </div>
                {/* My game */}
                <div className="statusBoard">
                    <h3> HOLD </h3>
                    <SingleTetBoard 
                        color={tetrominoTypeToColor(heldBlock)} 
                        pos={tetrominoTypeToNextPos(heldBlock)} />
                    <h3> KO </h3>
                    <h4> {ko} </h4>
                    <h3> LINES SENT </h3>
                    <h4> {totalLinesSent} </h4>
                </div>
                <div className="emptySpace1"></div>
                <div className="gameBoard">
                    {myBoard}
                    {resultText !== null && 
                        <h4> {resultText} </h4>
                    }
                </div>
                <div className="emptySpace1"></div>
                <div className="statusBoard">
                    <h3> NEXT </h3>
                    <SingleTetBoard 
                        color={tetrominoTypeToColor(nextTetType)} 
                        pos={tetrominoTypeToNextPos(nextTetType)} />
                </div>
                <div className="emptySpace3"></div>
                {/* Opponent's game */}
                <div className="statusBoard">
                    <h3> HOLD </h3>
                    <SingleTetBoard 
                        color={tetrominoTypeToColor(oppHeldBlock)} 
                        pos={tetrominoTypeToNextPos(oppHeldBlock)} />
                    <h3> KO </h3>
                    <h4> {oppKo} </h4>
                    <h3> LINES SENT </h3>
                    <h4> {oppTotalLinesSent} </h4>
                </div>
                <div className="emptySpace1"></div>
                <div className="gameBoard">
                    {oppBoard}
                    {oppResultText !== null && 
                        <h4> {oppResultText} </h4>
                    }
                </div>
                <div className="emptySpace1"></div>
                <div className="statusBoard">
                    <h3> NEXT </h3>
                    <SingleTetBoard 
                        color={tetrominoTypeToColor(oppNextTetType)} 
                        pos={tetrominoTypeToNextPos(oppNextTetType)} />
                </div>
            </div>
        );
    }

}

export default TetrisBattle;