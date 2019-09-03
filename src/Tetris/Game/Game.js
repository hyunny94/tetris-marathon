import React from 'react';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import './game.css';
import { clearInterval } from 'timers';

class Game extends React.Component {
    constructor(props) {
        super(props);
        const gameBoard = [];
        for (let r = 0; r < 22; r++) {
            gameBoard.push([]);
            for (let c = 0; c < 10; c++) {
                gameBoard[r].push(
                    { filled: false, color: "lightgray", active: false }
                );
            }
        }
        this.state = {
            time: 0,
            score: 0,
            isAlive: true,
            gameBoard: gameBoard,
            active: [
                { row: -1, col: -1 },
                { row: -1, col: -1 },
                { row: -1, col: -1 },
                { row: -1, col: -1 }
            ],
        };

        this.drop = this.drop.bind(this);
        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
    }

    handleKeyboardInput(event) {
        // left arrow
        if (event.keyCode === 37) {
            console.log("left");
            this.moveLeftRight("left");
        }
        // up arrow
        else if (event.keyCode === 38) {
            console.log("up");
        }
        // right arrow
        else if (event.keyCode === 39) {
            console.log("right");
            this.moveLeftRight("right");
        }
        // down arrow
        else if (event.keyCode === 40) {
            console.log("down");
            this.drop();
        }
        // space bar
        else if (event.keyCode === 32) {
            console.log("space");
        }
    }

    componentDidMount() {

        this.timerID = setInterval(() => {
            this.setState({
                time: this.state.time + 1
            })
        }, 1000);

        this.releaseNextBlock();
        this.timerID2 = setInterval(this.drop, 1000);
        document.addEventListener("keydown", this.handleKeyboardInput, false);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
        clearInterval(this.timerID2);
        document.removeEventListener("keydown", this.handleKeyboardInput, false);
    }

    releaseNextBlock() {
        console.log("releaseNextBlock");
        const nextBlock = Math.floor(Math.random() * 7);
        let nextPos = this.state.active;
        let nextColor = null;
        switch (nextBlock) {
            case 0:
                nextColor = "red";
                nextPos[0] = { row: 0, col: 5 };
                nextPos[1] = { row: 1, col: 4 };
                nextPos[2] = { row: 1, col: 5 };
                nextPos[3] = { row: 1, col: 6 };
                break;
            case 1:
                nextColor = "orange";
                nextPos[0] = { row: 0, col: 6 };
                nextPos[1] = { row: 1, col: 4 };
                nextPos[2] = { row: 1, col: 5 };
                nextPos[3] = { row: 1, col: 6 };
                break;
            case 2:
                nextColor = "yellow";
                nextPos[0] = { row: 0, col: 4 };
                nextPos[1] = { row: 1, col: 4 };
                nextPos[2] = { row: 1, col: 5 };
                nextPos[3] = { row: 1, col: 6 };
                break;
            case 3:
                nextColor = "green";
                nextPos[0] = { row: 1, col: 3 };
                nextPos[1] = { row: 1, col: 4 };
                nextPos[2] = { row: 1, col: 5 };
                nextPos[3] = { row: 1, col: 6 };
                break;
            case 4:
                nextColor = "blue";
                nextPos[0] = { row: 0, col: 4 };
                nextPos[1] = { row: 0, col: 5 };
                nextPos[2] = { row: 1, col: 4 };
                nextPos[3] = { row: 1, col: 5 };
                break;
            case 5:
                nextColor = "navy";
                nextPos[0] = { row: 0, col: 5 };
                nextPos[1] = { row: 0, col: 6 };
                nextPos[2] = { row: 1, col: 4 };
                nextPos[3] = { row: 1, col: 5 };
                break;
            case 6:
                nextColor = "purple";
                nextPos[0] = { row: 0, col: 4 };
                nextPos[1] = { row: 0, col: 5 };
                nextPos[2] = { row: 1, col: 5 };
                nextPos[3] = { row: 1, col: 6 };
                break;
            default:
                break;
        }
        const gameBoard = this.state.gameBoard;
        for (let pos of nextPos) {
            gameBoard[pos['row']][pos['col']] = { filled: true, color: nextColor, active: true };
        }
        this.setState({
            active: nextPos,
            gameBoard: gameBoard,
        }, () => console.log(this.state));

    }

    drop() {
        console.log("drop");
        let canDrop = true;
        let active = this.state.active;
        let board = this.state.gameBoard;
        for (let pos of active) {
            const row = pos['row'];
            const col = pos['col'];
            if (row === 21 ||
                (!board[row + 1][col]['active'] && board[row + 1][col]['filled'])) {
                // turn this collection of blocks to inactive,
                for (let pos of active) {
                    board[pos['row']][pos['col']]['active'] = false
                }
                canDrop = false;
            }
        }

        if (!canDrop) {
            console.log("cannot drop no more");
            this.releaseNextBlock();
        } else {
            // All positions clear. the block can move down. 
            for (let i = active.length - 1; i >= 0; i--) {
                let pos = active[i];
                let prev_color = board[pos['row']][pos['col']]['color'];
                board[pos['row']][pos['col']] = { filled: false, color: "lightgray", active: false };
                board[pos['row'] + 1][pos['col']] = { filled: true, color: prev_color, active: true };
            }
            this.setState({
                gameBoard: board,
                active: active.map((e) => { e['row'] = e['row'] + 1; return e; })
            });
        }
        console.log(this.state);
    }

    moveLeftRight(dir) {
        let canMove = true;
        let active = this.state.active;
        let board = this.state.gameBoard;
        let dir_int = dir === "left" ? -1 : 1;

        // check if the block can move
        for (let pos of active) {
            const row = pos['row'];
            const col = pos['col'];
            if (dir === "left") {
                // running into the wall or a left neighbor
                if (col === 0 || (!board[row][col + dir_int]['active'] && board[row][col + dir_int]['filled'])) {
                    canMove = false;
                }
            }
            else if (dir === "right") {
                // running into the wall or a left neighbor
                if (col === 9 || (!board[row][col + dir_int]['active'] && board[row][col + dir_int]['filled'])) {
                    canMove = false;
                }
            }
        }

        // move or not
        if (!canMove) {
            console.log("cannot move " + dir);

        } else {
            // All positions clear. the block can move down. 
            if (dir === "left") {
                active.sort((a, b) => { return a['col'] - b['col'] }); // sort the active block positions w.r.t the column number in ASCENDING order.    
            }
            else {
                active.sort((a, b) => { return b['col'] - a['col'] }); // sort the active block positions w.r.t the column number in DESCENDING order.    
            }
            for (let pos of active) {
                let prev_color = board[pos['row']][pos['col']]['color'];
                board[pos['row']][pos['col']] = { filled: false, color: "lightgray", active: false };
                board[pos['row']][pos['col'] + dir_int] = { filled: true, color: prev_color, active: true };
            }
            this.setState({
                gameBoard: board,
                active: active.map((e) => {
                    e['col'] = e['col'] + dir_int; return e;
                })
            });
        }
        console.log(this.state);
    }

    render() {
        return (
            <React.Fragment>
                <GameBoard gameBoard={this.state.gameBoard} />
                <ScoreBoard
                    // nextBlock={this.props.nextBlock}
                    time={this.state.time}
                    score={this.state.score}
                />
            </React.Fragment>
        );
    }

}

export default Game;