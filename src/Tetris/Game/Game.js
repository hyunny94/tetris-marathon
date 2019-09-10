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
                    { filled: false, color: "#2C2726", active: false, pivot: false }
                );
            }
        }

        /** 
         * Q. Why would this be any different from above? This doesn't work.. 
         * const gameBoard = new Array(40).fill(
         * new Array(10).fill(
         * { filled: false, color: "#2C2726", active: false, pivot: false }
         * )
         * ); */

        this.state = {
            time: 0,
            score: 0,
            isAlive: true,
            isPaused: false,
            gameBoard: gameBoard,
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
            nextTetType: Math.floor(Math.random() * 7)
        };

        this.drop = this.drop.bind(this);
        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
        this.handleSpaceInput = this.handleSpaceInput.bind(this);
    }


    handleKeyboardInput(event) {
        event.preventDefault();
        switch (event.keyCode) {
            case 16: // "shift" for holding a piece OR exchanging with held piece
                console.log("hold or exchange");
                !this.state.isPaused && this.holdOrExchange();
                break;
            case 37: // left arrow
                console.log("left");
                !this.state.isPaused && this.moveLeftRight("left");
                break;
            case 38: // up arrow
                console.log("up");
                !this.state.isPaused && this.rotate();
                break;
            case 39: // right arrow
                console.log("right");
                !this.state.isPaused && this.moveLeftRight("right");
                break;
            case 40: // down arrow
                console.log("down");
                !this.state.isPaused && this.drop();
                break;
            case 80: // "p" for pausing OR resuming the game
                console.log("pause or resume");
                this.pauseOrResume();
                break;
            default:
                break;
        }
    }


    componentDidMount() {
        this.timerID = setInterval(() => {
            this.setState({
                time: this.state.time + 1
            })
        }, 1000);
        this.releaseNextTetromino();
        this.timerID2 = setInterval(this.drop, 1000);
        document.addEventListener("keydown", this.handleKeyboardInput, false);
    }


    componentWillUnmount() {
        clearInterval(this.timerID);
        clearInterval(this.timerID2);
        document.removeEventListener("keydown", this.handleKeyboardInput, false);
    }


    releaseNextTetromino() {
        console.log("releaseNextTetromino");
        this.setState((state, props) => {
            const nextTetromino = state.nextTetType;
            const nextnextTet = Math.floor(Math.random() * 7);
            let nextPos = this.tetrominoTypeToNextPos(nextTetromino);
            let nextColor = this.tetrominoTypeToColor(nextTetromino);
            // check if there are filled blocks in the place of next new blocks
            const board = state.gameBoard;
            let unavailable_row = new Set();
            nextPos.forEach((pos) => {
                if (board[pos['row']][pos['col']]['filled']) {
                    unavailable_row.add(pos['row']);
                }
            });
            nextPos = nextPos.map((pos) => {
                return { ...pos, row: pos['row'] - unavailable_row.size };
            })
            // update board
            nextPos.forEach((pos) => {
                board[pos['row']][pos['col']] = { filled: true, color: nextColor, active: true, pivot: pos['pivot'] }
            });

            return {
                active: nextPos,
                gameBoard: board,
                activeBlockType: nextTetromino,
                activeBlockOrientation: 0,
                nextTetType: nextnextTet,
            }
        });
    }


    drop() {
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
                break;
            }
        }

        if (!canDrop) {
            console.log("cannot drop no more");
            this.checkGameOver();
            this.clearRows();
            this.releaseNextTetromino();
            this.setState({
                holdUsed: false,
            })
        } else {
            // All positions clear. the block can move down. 
            // active ones => inactive
            let color = this.tetrominoTypeToColor(this.state.activeBlockType);
            board = this.currActiveToInactive(board);
            // new positions => active
            for (let pos of active) {
                board[pos['row'] + 1][pos['col']] =
                    { filled: true, color: color, active: true, pivot: pos['pivot'] };
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
                board[pos['row']][pos['col']] = { filled: false, color: "#2C2726", active: false, pivot: false };
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

        let next_pos = next_pos_dict[blockType][blockOrientation];

        // 1. if any of the new positions after the rotation is filled.
        for (let pos of next_pos) {
            let row = pivot['row'] + pos['row'];
            let col = pivot['col'] + pos['col'];
            if (row > 39 || col < 0 || col > 9 || (!board[row][col]['active'] && board[row][col]['filled'])) {
                return;
            }
        }
        // rotate
        // active ones => inactive
        let color = this.tetrominoTypeToColor(this.state.activeBlockType);
        board = this.currActiveToInactive(board);

        // new positions => active
        let new_active = []
        for (let pos of next_pos) {
            let row = pivot['row'] + pos['row'];
            let col = pivot['col'] + pos['col'];

            new_active.push({ row: row, col: col, pivot: pos['pivot'] });
            board[row][col] = { filled: true, color: color, active: true, pivot: pos['pivot'] };
        }

        const nextOrientation = blockOrientation === 3 ? 0 : blockOrientation + 1;

        this.setState({
            gameBoard: board,
            active: new_active,
            activeBlockOrientation: nextOrientation,
        });
    }

    clearRows() {
        const board = this.state.gameBoard;

        // only add non-full rows starting from the bottom 
        let newBoard = [];
        for (let r = board.length - 1; r >= 20; r--) {
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
                row.push({ filled: false, color: "#2C2726", active: false, pivot: false });
            }
            newBoard.unshift(row);
        }

        this.setState({
            gameBoard: newBoard,
            score: this.state.score + numClearedRow - 20,
        });

    }

    checkGameOver() {
        const board = this.state.gameBoard;
        for (let r = 18; r < 20; r++) {
            for (let c = 3; c < 7; c++) {
                if (board[r][c]['filled']) {
                    return this.props.handleGameOver(this.state.score);
                }
            }
        }
    }

    handleSpaceInput(ghostPieceSet) {
        // event.preventDefault();
        const board = this.currActiveToInactive(this.state.gameBoard);
        const blockColor = this.tetrominoTypeToColor(this.state.activeBlockType);

        // inactive ones => active 
        let newActive = [];
        ghostPieceSet.forEach((pos) => {
            const row = Math.floor(Number(pos) / 10);
            const col = Number(pos) % 10;
            board[row][col] = { filled: true, color: blockColor, active: true, pivot: false };
            newActive.push({ row: row, col: col, pivot: false });
        })

        this.setState({
            gameBoard: board,
            active: newActive
        }, () => {
            clearInterval(this.timerID2);
            this.drop();
            this.timerID2 = setInterval(this.drop, 1000);
        });
    }

    pauseOrResume() {
        const isPaused = this.state.isPaused;
        if (isPaused) {
            this.timerID = setInterval(() => {
                this.setState({
                    time: this.state.time + 1
                })
            }, 1000);
            this.timerID2 = setInterval(this.drop, 1000);
        }
        else {
            clearInterval(this.timerID);
            clearInterval(this.timerID2);
        }
        this.setState({
            isPaused: !isPaused
        });
    }

    holdOrExchange() {
        if (!this.state.holdUsed) {
            const heldBlock = this.state.heldBlock;
            console.log("curr held block is");
            console.log(heldBlock);
            // Exchange
            // make current active to inactive 
            let board = this.currActiveToInactive(this.state.gameBoard);

            if (heldBlock !== null) {
                const newActive = this.tetrominoTypeToNextPos(heldBlock);
                const newColor = this.tetrominoTypeToColor(heldBlock);
                // make new position depending on [heldBlock] active
                board = this.currInactiveToActive(board, newActive, newColor);
                // update currBlockType, currBlockOrientation, heldBlock, holdUsed, active, board
                this.setState({
                    activeBlockType: heldBlock,
                    activeBlockOrientation: 0,
                    heldBlock: this.state.activeBlockType,
                    holdUsed: true,
                    active: newActive,
                    board: board,
                })
            }
            // Very First Hold
            else {
                // heldBlock, holdUsed, active, board
                const nextTetromino = this.state.nextTetType
                const newActive = this.tetrominoTypeToNextPos(nextTetromino);
                const newColor = this.tetrominoTypeToColor(nextTetromino);
                board = this.currInactiveToActive(board, newActive, newColor);
                this.setState({
                    activeBlockType: nextTetromino,
                    activeBlockOrientation: 0,
                    heldBlock: this.state.activeBlockType,
                    holdUsed: true,
                    active: newActive,
                    board: board,
                })
            }
        }
    }

    tetrominoTypeToNextPos(type) {
        switch (type) {
            case 0: // T
                return [{ row: 20, col: 4, pivot: false },
                { row: 21, col: 3, pivot: false },
                { row: 21, col: 4, pivot: true },
                { row: 21, col: 5, pivot: false }]
            case 1: // J
                return [{ row: 20, col: 5, pivot: false },
                { row: 21, col: 3, pivot: false },
                { row: 21, col: 4, pivot: true },
                { row: 21, col: 5, pivot: false }]
            case 2: // L
                return [{ row: 20, col: 3, pivot: false },
                { row: 21, col: 3, pivot: false },
                { row: 21, col: 4, pivot: true },
                { row: 21, col: 5, pivot: false }]
            case 3: // I 
                return [{ row: 21, col: 3, pivot: false },
                { row: 21, col: 4, pivot: false },
                { row: 21, col: 5, pivot: true },
                { row: 21, col: 6, pivot: false }]
            case 4: // O
                return [{ row: 20, col: 4, pivot: false },
                { row: 20, col: 5, pivot: false },
                { row: 21, col: 4, pivot: false },
                { row: 21, col: 5, pivot: false }]
            case 5: // S
                return [{ row: 20, col: 4, pivot: false },
                { row: 20, col: 5, pivot: false },
                { row: 21, col: 3, pivot: false },
                { row: 21, col: 4, pivot: true }]
            case 6: // Z
                return [{ row: 20, col: 3, pivot: false },
                { row: 20, col: 4, pivot: false },
                { row: 21, col: 4, pivot: true },
                { row: 21, col: 5, pivot: false }]
            default:
                return;
        }
    }

    tetrominoTypeToColor(type) {
        switch (type) {
            case 0: // T
                return "#C608F4";
            case 1: // J
                return "#134EEA";
            case 2: // L
                return "#EFC30E";
            case 3: // I 
                return "cyan";
            case 4: // O
                return "yellow";
            case 5: // S
                return "#24EA13";
            case 6: // Z
                return "#F83F08";
            default:
                return;
        }
    }

    // return new [gameBoard] with curr [active] turned off
    currActiveToInactive(board) {
        const active = this.state.active;
        active.forEach((pos) => {
            board[pos['row']][pos['col']] =
                { filled: false, color: "#2C2726", active: false, pivot: false };
        })
        return board;
    }

    // return new [board] with [newActive] turned on. Each block has [newColor].
    currInactiveToActive(board, newActive, newColor) {
        newActive.forEach((pos) => {
            board[pos['row']][pos['col']] =
                { filled: true, color: newColor, active: true, pivot: pos['pivot'] };
        })
        return board;
    }

    render() {
        return (
            <React.Fragment>
                <GameBoard
                    gameBoard={this.state.gameBoard}
                    active={this.state.active}
                    handleSpaceInput={this.handleSpaceInput}
                    isPaused={this.state.isPaused}
                />
                <ScoreBoard
                    // nextTetromino={this.props.nextTetromino}
                    time={this.state.time}
                    score={this.state.score}
                    nextTetColor={this.tetrominoTypeToColor(this.state.nextTetType)}
                    nextTetPos={this.tetrominoTypeToNextPos(this.state.nextTetType)}
                    heldTetColor={this.tetrominoTypeToColor(this.state.heldBlock)}
                    heldTetPos={this.tetrominoTypeToNextPos(this.state.heldBlock)}
                />
            </React.Fragment>
        );
    }

}

export default Game;