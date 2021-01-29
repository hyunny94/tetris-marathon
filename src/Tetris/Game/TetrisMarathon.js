import React from 'react';
import SingleTetBoard from './Components/SingleTetBoard';
import './game.css';
import { getCleanBoard, drawGhostPiece, releaseNextTetromino, 
    holdOrExchange, moveLeft, moveRight, rotate,
    drop, handleSpaceInput, pauseOrResume,
    tetrominoTypeToColor, tetrominoTypeToNextPos,
    ghostPiece, ghostColor } from '../Functions';


class TetrisMarathon extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // NEW
            // 1. clearRows() function used to return a score increment amount, and drop() used to update score state by that 
            // amount + 8 if hardDrop === true else + 4 
            score: 0, 
            // NEW
            /**
             * 3. incremented in clearRows() 
             */
            totalLinesCleared: 0, // level is 1 + [totalLinesCleared] // 10
            combo: -1, 
            // NEW
            /**
             * i think this can be deleted..
             */
            isAlive: true, 
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
            // NEW
            /**
             * 1. set to true in handleSpaceInput() 
             * 2. used to determine whether to increment score by 8 or 4 during drop()
             */
            hardDrop: false, 
            prevMoveDifficult: false, // currently tetris (4 line clears) is the only difficult move there is.
            softDropTimer: null
        };

        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
        this.gameOverHandler = this.gameOverHandler.bind(this);
        this.beforeClearRows = this.beforeClearRows.bind(this);
        this.afterClearRows = this.afterClearRows.bind(this);
    }

    handleKeyboardInput(event) {
        event.preventDefault();

        // "p" for pausing OR resuming the game
        if (event.keyCode === 80) {
            let softDropTimer = null
            if (this.state.isPaused) {
                softDropTimer = setInterval(() => {
                    this.setState(drop(this.state, this.beforeClearRows, this.afterClearRows, this.gameOverHandler))
                }, this.getSoftDropSpeed(this.state))
            } 
            this.setState(pauseOrResume(this.state, softDropTimer));
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
                newState = drop(this.state, this.beforeClearRows, this.afterClearRows, this.gameOverHandler);
                break;
            case 32: // space 
                newState = {...handleSpaceInput(this.state), hardDrop: true};
                newState = drop(newState, this.beforeClearRows, this.afterClearRows);
                break;
            default:
                break;
        }
        this.setState(newState);
    }

    componentDidMount() {
        this.setState(releaseNextTetromino(this.state), 
            () => {
                this.setState({softDropTimer: setInterval(() => {
                    this.setState(drop(this.state, this.beforeClearRows, this.afterClearRows, this.gameOverHandler))
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

    gameOverHandler(state) {
        this.props.handleTetrisMarathonOver(state.score);
    }

    /**
     * This function should occur inside drop() before clearRows() to 
     * update game state uniquely for this game.
     */
    beforeClearRows(state) {
        let { score, totalLinesCleared } = state;
        score += this.getScoreIncrement(state);
        totalLinesCleared += this.getNumClearedRows(state);
        return {...state, score, totalLinesCleared}
    }

    /**
     * This function should occur inside drop() after clearRows() and 
     * before releaseNextTetromino() to update game state
     * uniquely for this game.
     */
    afterClearRows(state) {
        clearInterval(state.softDropTimer);
        let softDropSpeed = this.getSoftDropSpeed(state);
        let softDropTimer = setInterval(() => {
            this.setState(drop(this.state, this.beforeClearRows, this.afterClearRows, this.gameOverHandler))
        }, softDropSpeed);
        return {...state, softDropTimer, hardDrop: false}
    }

    /**
     * @param {Object} state current game state
     * @returns {Number} number of full rows to be cleared
     */
    getNumClearedRows(state) {
        let { gameBoard } = state;
        let count = 0;
        for (let r = gameBoard.length - 1; r >= 20; r--) {
            let filled = true;
            for (let c = 0; c < 10; c++) {
                if (!gameBoard[r][c]['filled']) {
                    filled = false;
                }
            }
            if (filled) {
                count += 1;
            }
        }
        return count;
    }

    /**
     * @param {Object} state current game state
     * @returns {Number} score increment
     */
    getScoreIncrement(state) {
        let { hardDrop, prevMoveDifficult, 
              combo, totalLinesCleared } = state;
        // Increment when we see a full row starting from the bottom 
        let count = this.getNumClearedRows(state);
        const level = this.getLevel(totalLinesCleared);
        const newCombo = count > 0 ? combo + 1 : -1;
        const comboScore = newCombo >= 1 ? 50 * newCombo * level : 0;
        // Hard drop is 8 points and soft drop is 4 points. 
        let scoreIncrement = hardDrop ? 8 : 4;
        switch (count) {
            case 0:
                scoreIncrement += 0;
                break;
            case 1:
                scoreIncrement += 100 * level + comboScore;
                break;
            case 2:
                scoreIncrement += 300 * level + comboScore;
                break;
            case 3:
                scoreIncrement += 500 * level + comboScore;
                break;
            case 4:
                scoreIncrement += prevMoveDifficult ? 1200 * level + comboScore : 800 * level + comboScore;
                break;
        }   
        return scoreIncrement;
    }

    getLevel(totalLinesCleared) {
        return 1 + Math.floor(totalLinesCleared / 10);
    }
    
    /**
     * Return current speed of tetromino drop in ms. 
     * Fastest rate is 1 line drop per 0.1 second.
     * Speed increases by 50ms every level
     * @param {*} state 
     * @returns {Number} soft drop speed
     */
    getSoftDropSpeed(state) {
        let { totalLinesCleared } = state
        return Math.max(100, 1050 - (50 * this.getLevel(totalLinesCleared)));
    }

    render() {
        let { score, heldBlock, totalLinesCleared, nextTetType, 
            gameBoard, active } = this.state;
        let { name } = this.props;
        return (
            <div className="gameContainer">
                <div className="topBoard">
                    <h3 style={{display: "inline-block",  
                    width: "250px", height: "50px"}}> {name} </h3>
                    <h3 style={{display: "inline-block", 
                    width: "250px", height: "50px", whiteSpace: "pre-line"}}> SCORE {"\n"} {score} </h3>
                </div>
                <div className="statusBoard">
                    <h3> HOLD </h3>
                    <SingleTetBoard 
                        color={tetrominoTypeToColor(heldBlock)} 
                        pos={tetrominoTypeToNextPos(heldBlock)} />
                    <h3> LEVEL </h3>
                    <h4> {this.getLevel(totalLinesCleared)} </h4>
                    <h3> LINES </h3>
                    <h4> {totalLinesCleared} </h4>
                </div>
                <div className="emptySpace1"></div>
                <div className="gameBoard">
                    {drawGhostPiece(gameBoard, ghostPiece(gameBoard, active), ghostColor(gameBoard, active))}
                </div>
                <div className="emptySpace1"></div>
                <div className="statusBoard">
                    <h3> NEXT </h3>
                    <SingleTetBoard 
                        color={tetrominoTypeToColor(nextTetType)} 
                        pos={tetrominoTypeToNextPos(nextTetType)} />
                </div>
            </div>
        );
    }

}

export default TetrisMarathon;