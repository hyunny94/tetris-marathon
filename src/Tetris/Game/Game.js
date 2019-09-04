import React from 'react';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import './game.css';

class Game extends React.Component {
    constructor(props) {
        super(props);
        const gameBoard = [];
        for (let r = 0; r < 40; r++) {
            gameBoard.push([]);
            for (let c = 0; c < 10; c++) {
                gameBoard[r].push(
                    { filled: false, color: "lightgray", active: false, pivot: false }
                );
            }
        }

        this.state = {
            time: 0,
            score: 0,
            isAlive: true,
            gameBoard: gameBoard,
            active: [
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false },
                { row: -1, col: -1, pivot: false }
            ],
            activeBlockType: null,
            activeBlockOrientation: 0,
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
            this.rotate();
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
            case 0: // T
                nextColor = "purple";
                nextPos[0] = { row: 20, col: 4, pivot: false };
                nextPos[1] = { row: 21, col: 3, pivot: false };
                nextPos[2] = { row: 21, col: 4, pivot: true };
                nextPos[3] = { row: 21, col: 5, pivot: false };
                break;
            case 1: // J
                nextColor = "blue";
                nextPos[0] = { row: 20, col: 5, pivot: false };
                nextPos[1] = { row: 21, col: 3, pivot: false };
                nextPos[2] = { row: 21, col: 4, pivot: true };
                nextPos[3] = { row: 21, col: 5, pivot: false };
                break;
            case 2: // L
                nextColor = "orange";
                nextPos[0] = { row: 20, col: 3, pivot: false };
                nextPos[1] = { row: 21, col: 3, pivot: false };
                nextPos[2] = { row: 21, col: 4, pivot: true };
                nextPos[3] = { row: 21, col: 5, pivot: false };
                break;
            case 3: // I 
                nextColor = "cyan";
                nextPos[0] = { row: 21, col: 3, pivot: false };
                nextPos[1] = { row: 21, col: 4, pivot: false };
                nextPos[2] = { row: 21, col: 5, pivot: true };
                nextPos[3] = { row: 21, col: 6, pivot: false };
                break;
            case 4: // O
                nextColor = "yellow";
                nextPos[0] = { row: 20, col: 4, pivot: false };
                nextPos[1] = { row: 20, col: 5, pivot: false };
                nextPos[2] = { row: 21, col: 4, pivot: false };
                nextPos[3] = { row: 21, col: 5, pivot: false };
                break;
            case 5: // S
                nextColor = "green";
                nextPos[0] = { row: 20, col: 4, pivot: false };
                nextPos[1] = { row: 20, col: 5, pivot: false };
                nextPos[2] = { row: 21, col: 3, pivot: false };
                nextPos[3] = { row: 21, col: 4, pivot: true };
                break;
            case 6: // Z
                nextColor = "red";
                nextPos[0] = { row: 20, col: 3, pivot: false };
                nextPos[1] = { row: 20, col: 4, pivot: false };
                nextPos[2] = { row: 21, col: 4, pivot: true };
                nextPos[3] = { row: 21, col: 5, pivot: false };
                break;
            default:
                break;
        }

        // check for game-over
        if (this.gameOver(nextPos)) {
            this.props.handleGameOver();
        }

        const gameBoard = this.state.gameBoard;
        for (let pos of nextPos) {
            gameBoard[pos['row']][pos['col']] = { filled: true, color: nextColor, active: true, pivot: pos['pivot'] };
        }
        this.setState({
            active: nextPos,
            gameBoard: gameBoard,
            activeBlockType: nextBlock,
            activeBlockOrientation: 0,
        });
    }

    drop() {
        console.log("drop");
        let canDrop = true;
        let active = this.state.active;
        let board = this.state.gameBoard;
        for (let pos of active) {
            const row = pos['row'];
            const col = pos['col'];
            if (row === 39 ||
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
            this.clearRows();
            this.releaseNextBlock();
        } else {
            // All positions clear. the block can move down. 
            // active ones => inactive
            let color = null;
            for (let pos of active) {
                color = board[pos['row']][pos['col']]['color'];
                board[pos['row']][pos['col']] = { filled: false, color: "lightgray", active: false, pivot: false };
            }
            // new positions => active
            for (let pos of active) {
                board[pos['row'] + 1][pos['col']] = { filled: true, color: color, active: true, pivot: pos['pivot'] };
            }
            this.setState({
                gameBoard: board,
                active: active.map((e) => { e['row'] = e['row'] + 1; return e; })
            });
        }
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
                let prev_pivot = board[pos['row']][pos['col']]['pivot'];
                board[pos['row']][pos['col']] = { filled: false, color: "lightgray", active: false, pivot: false };
                board[pos['row']][pos['col'] + dir_int] = { filled: true, color: prev_color, active: true, pivot: prev_pivot };
            }
            this.setState({
                gameBoard: board,
                active: active.map((e) => {
                    e['col'] = e['col'] + dir_int; return e;
                })
            });
        }
    }

    rotate() {
        // get relevant states
        let board = this.state.gameBoard;
        let active = this.state.active;
        let blockType = this.state.activeBlockType;
        let blockOrientation = this.state.activeBlockOrientation;

        // rotation algorithm for each block type
        let next_pos_dict = {
            0: {
                0: [{ row: -1, col: 0, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 1, col: 0, pivot: false }, { row: 0, col: 1, pivot: false }],
                1: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: 1, pivot: false }, { row: 1, col: 0, pivot: false }],
                2: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 1, col: 0, pivot: false }, { row: -1, col: 0, pivot: false }],
                3: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: 1, pivot: false }, { row: -1, col: 0, pivot: false }],
            },
            1: {
                0: [{ row: -1, col: 0, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 1, col: 0, pivot: false }, { row: 1, col: 1, pivot: false }],
                1: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: 1, pivot: false }, { row: 1, col: -1, pivot: false }],
                2: [{ row: -1, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: -1, col: 0, pivot: false }, { row: 1, col: 0, pivot: false }],
                3: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: 1, pivot: false }, { row: -1, col: 1, pivot: false }],
            },
            2: {
                0: [{ row: -1, col: 1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: -1, col: 0, pivot: false }, { row: 1, col: 0, pivot: false }],
                1: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: 1, pivot: false }, { row: 1, col: 1, pivot: false }],
                2: [{ row: -1, col: 0, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 1, col: 0, pivot: false }, { row: 1, col: -1, pivot: false }],
                3: [{ row: -1, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: -1, pivot: false }, { row: 0, col: 1, pivot: false }],
            },
            3: {
                0: [{ row: -1, col: 0, pivot: false }, { row: 0, col: 0, pivot: false }, { row: 1, col: 0, pivot: true }, { row: 2, col: 0, pivot: false }],
                1: [{ row: 0, col: -2, pivot: false }, { row: 0, col: -1, pivot: true }, { row: 0, col: 0, pivot: false }, { row: 0, col: 1, pivot: false }],
                2: [{ row: -2, col: 0, pivot: false }, { row: -1, col: 0, pivot: true }, { row: 0, col: 0, pivot: false }, { row: 1, col: 0, pivot: false }],
                3: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: false }, { row: 0, col: 1, pivot: true }, { row: 0, col: 2, pivot: false }],
            },
            5: {
                0: [{ row: -1, col: 0, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: 1, pivot: false }, { row: 1, col: 1, pivot: false }],
                1: [{ row: 0, col: 1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 1, col: 0, pivot: false }, { row: 1, col: -1, pivot: false }],
                2: [{ row: 1, col: 0, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: -1, pivot: false }, { row: -1, col: -1, pivot: false }],
                3: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: -1, col: 0, pivot: false }, { row: -1, col: 1, pivot: false }],
            },
            6: {
                0: [{ row: 1, col: 0, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: 1, pivot: false }, { row: -1, col: 1, pivot: false }],
                1: [{ row: 0, col: -1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 1, col: 0, pivot: false }, { row: 1, col: 1, pivot: false }],
                2: [{ row: -1, col: 0, pivot: false }, { row: 0, col: 0, pivot: true }, { row: 0, col: -1, pivot: false }, { row: 1, col: -1, pivot: false }],
                3: [{ row: 0, col: 1, pivot: false }, { row: 0, col: 0, pivot: true }, { row: -1, col: 0, pivot: false }, { row: -1, col: -1, pivot: false }],
            },
        };

        // find pivot
        let pivot = null;
        for (let pos of active) {
            if (board[pos['row']][pos['col']]['pivot']) {
                pivot = pos;
            }
        }

        // check if we can rotate
        // 0. not the square one :)
        if (!pivot) {
            return;
        }

        // 1. new positions are filled with inactive block.
        let next_pos = next_pos_dict[blockType][blockOrientation];

        for (let pos of next_pos) {
            let row = pivot['row'] + pos['row'];
            let col = pivot['col'] + pos['col'];
            if (row > 39 || col < 0 || col > 9 || (!board[row][col]['active'] && board[row][col]['filled'])) {
                return;
            }
        }
        // rotate
        // active ones => inactive
        let color = null;
        for (let pos of active) {
            color = board[pos['row']][pos['col']]['color'];
            board[pos['row']][pos['col']] = { filled: false, color: "lightgray", active: false, pivot: false };
        }

        // new positions => active
        let new_active = []
        for (let pos of next_pos) {
            let row = pivot['row'] + pos['row'];
            let col = pivot['col'] + pos['col'];

            console.log("row: " + row + ', col: ' + col);

            new_active.push({ row: row, col: col, pivot: pos['pivot'] });
            board[row][col] = { filled: true, color: color, active: true, pivot: pos['pivot'] };
        }

        const nextOrientation = blockOrientation === 3 ? 0 : blockOrientation + 1;

        this.setState({
            gameBoard: board,
            active: new_active,
            activeBlockOrientation: nextOrientation,
        }, () => console.log(this.state));
    }

    clearRows() {
        const board = this.state.gameBoard;

        // only add non-full rows starting from the bottom 
        let newBoard = [];
        for (let r = board.length - 1; r >= 0; r--) {
            let filled = true;
            for (let c = 0; c < 10; c++) {
                if (!board[r][c]['filled']) {
                    filled = false;
                }
            }
            if (!filled) {
                let row = [];
                for (let c = 0; c < 10; c++) {
                    row.push(board[r][c]);
                }
                newBoard.unshift(row);
            }
        }

        // fill the top 
        const numClearedRow = 40 - newBoard.length;
        for (let r = 0; r < numClearedRow; r++) {
            let row = [];
            for (let c = 0; c < 10; c++) {
                row.push({ filled: false, color: "lightgray", active: false, pivot: false });
            }
            newBoard.unshift(row);
        }

        this.setState({
            gameBoard: newBoard,
            score: this.state.score + numClearedRow,
        });

    }

    gameOver(nextPos) {
        const board = this.state.gameBoard;
        for (let pos of nextPos) {
            if (board[pos['row']][pos['col']]['filled']) {
                return true;
            }
        }
        return false;
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