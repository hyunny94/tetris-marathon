import React from 'react';
import Block from './Game/Components/Block';
import UIfx from 'uifx';
import doAudio from './sounds/do.wav';
import reAudio from './sounds/re.wav';
import miAudio from './sounds/mi.wav';
import faAudio from './sounds/fa.wav';
import solAudio from './sounds/sol.wav';
import laAudio from './sounds/la.wav';
import dropAudio from './sounds/drop.mp3';

const doSound = new UIfx(doAudio)
const reSound = new UIfx(reAudio)
const miSound = new UIfx(miAudio)
const faSound = new UIfx(faAudio)
const solSound = new UIfx(solAudio)
const laSound = new UIfx(laAudio)
const dropSound = new UIfx(dropAudio)

///////////////////////////////////////////////////////////////////////////////
// Helper functions
///////////////////////////////////////////////////////////////////////////////
/**
 * Make combo sound
 * 
 * @param {Number} combo number of combo 
 * @returns {null}
 */
function makeComboSound(combo) {
    switch (combo) {
        case -1:
            break
        case 0:
            break
        case 1:
            doSound.play()
            break
        case 2:
            reSound.play()
            break
        case 3:
            miSound.play()
            break
        case 4:
            faSound.play()
            break
        case 5:
            solSound.play()
            break
        default: // more than 5 combos! 
            laSound.play()
            break
    }
};

/**
 * Return a set of coordinates representing the location of the ghost tetromino.
 * Ex. {"305", "316", "317", "308"} 
 * @param {Object} state current state of the game
 * @returns {Set<string>} set of coordinates representing the ghost 
 */
function ghostPiece(state) {
    let { gameBoard, active } = state;
    let ghostPieces = active;

    // update [ghostPieces] to the location that the current tetromino would drop to.
    while (true) {
        let canDrop = true;
        for (let pos of ghostPieces) {
            const row = pos['row'];
            const col = pos['col'];
            // before start 
            if (row === -1) {
                return new Set();
            }
            if (row === 39 ||
                (!gameBoard[row + 1][col]['active'] && gameBoard[row + 1][col]['filled'])) {
                canDrop = false;
                break;
            }
        }
        if (canDrop) {
            ghostPieces = ghostPieces.map((e) => { return { ...e, row: e['row'] + 1 }; });
        } else {
            break;
        }
    }

    let ghostPieceSet = new Set();
    ghostPieces.forEach((pos) => {
        ghostPieceSet.add("" + pos['row'] + pos['col'])
    });

    return ghostPieceSet;
};

/**
 * Return the color of the ghost tetromino.
 * @param {Object} state current state of the game
 * @returns {String} color of the ghost tetromino 
 */
function ghostColor(state) {
    let { gameBoard, active } = state;
    const pos = active[0];
    if (pos['row'] === -1) {
        return "#2C2726";
    }
    return gameBoard[pos['row']][pos['col']]['color'];
}

/**
 * Return initial positions of the next tetromino.
 * @param {Number} type type of the tetromino 
 * @returns {Object[]} initial positions of the next tetromino
 */
export function tetrominoTypeToNextPos(type) {
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

/**
 * Return the color of a tetromino type
 * @param {Number} type type of the tetromino
 * @returns {String} color of the type of tetromino
 */
export function tetrominoTypeToColor(type) {
    switch (type) {
        case 0: // T
            return "#C608F4";
        case 1: // J
            return "#EFC30E";
        case 2: // L
            return "#134EEA";
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

/**
 * Return true if game is over
 * @param {Object[][]} gameBoard current game board
 * @returns {Boolean} true if game is over
 */
function checkGameOver(gameBoard) {
    for (let r = 18; r < 20; r++) {
        for (let c = 3; c < 7; c++) {
            if (gameBoard[r][c]['filled']) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Return a new game board with current active tet positions turned off.
 * @param {Object[][]} board current game board
 * @param {Object[]} active current active tet positions
 * @returns {Object[][]} new game board with current active tet positions turned inactive
 */
function currActiveToInactive(board, active) {
    active.forEach((pos) => {
        board[pos['row']][pos['col']] =
            { filled: false, color: "#2C2726", active: false, pivot: false };
    })
    return board;
}

/**
 * Return new board with newActive turned on. Each block has newColor.
 * @param {Object[][]} board current game board
 * @param {Object[]} newActive new active tet positions
 * @param {String} newColor color of the new tet
 * @returns {Object[][]} new game board with new active tetromino turned active
 */
function currInactiveToActive(board, newActive, newColor) {
    newActive.forEach((pos) => {
        board[pos['row']][pos['col']] =
            { filled: true, color: newColor, active: true, pivot: pos['pivot'] };
    })
    return board;
}

/**
 * Clear filled rows and update relevant states. 
 * 
 * @param {Object} state current state of the game
 * @returns {Object} updated state of the game
 */
function clearRows(state) {
    console.log("clearRows")
    let { gameBoard, combo } = state;
    // only add non-full rows starting from the bottom 
    let newBoard = [];
    // TODO: set gameBoard heights and width as constants so they can be easily
    //       changed. 
    for (let r = gameBoard.length - 1; r >= 20; r--) {
        let filled = true;
        for (let c = 0; c < 10; c++) {
            if (!gameBoard[r][c]['filled']) {
                filled = false;
            }
        }
        if (!filled) {
            let row = [];
            for (let c = 0; c < 10; c++) {
                row.push(gameBoard[r][c]);
            }
            newBoard.unshift(row);
        }
    }

    // fill the top 
    const remainingRows = 40 - newBoard.length;
    const numClearedRow = 20 - newBoard.length
    for (let r = 0; r < remainingRows; r++) {
        let row = [];
        for (let c = 0; c < 10; c++) {
            row.push({ filled: false, color: "#2C2726", active: false, pivot: false });
        }
        newBoard.unshift(row);
    }

    const newCombo = numClearedRow > 0 ? combo + 1 : -1;
    makeComboSound(newCombo);

    return {
        ...state,
        gameBoard: newBoard,
        combo: newCombo,
        prevMoveDifficult: numClearedRow === 4 ? true : false,
    };
}

///////////////////////////////////////////////////////////////////////////////
// Functions related to the game engine
///////////////////////////////////////////////////////////////////////////////
/**
 * Return a new game board with ghost drawn.
 * @param {Object} state current state of the game
 * @returns {JSX.Element[][]} new game board with ghost drawn 
 */
export function drawGhostPiece(state) {
    let { gameBoard } = state
    let ghostPieceSet = ghostPiece(state);
    let newBoard = [];
    for (let r = 20; r < gameBoard.length; r++) {
        let newRow = [];
        for (let c = 0; c < 10; c++) {
            let isGhostPiece = ghostPieceSet.has("" + r + c);
            newRow.push(<Block
                ghost={isGhostPiece}
                ghostColor={ghostColor(state)}
                active={gameBoard[r][c]['active']}
                pivot={gameBoard[r][c]['pivot']}
                color={gameBoard[r][c]['color']}
                filled={gameBoard[r][c]['filled']}
            />);
        }
        newBoard.push(newRow);
    }
    return newBoard
}

/**
 * Release the next tetromino to be played 
 * 
 * @param {Object} state current state of the game
 * @returns {Object} new state of the game
 */
export function releaseNextTetromino(state) {
    console.log("release")
    let { nextTetType, gameBoard } = state;
    let nextPos = tetrominoTypeToNextPos(nextTetType);
    let nextColor = tetrominoTypeToColor(nextTetType);
    // check if there are filled blocks in the place of next new blocks
    let unavailable_row = new Set();
    nextPos.forEach((pos) => {
        if (gameBoard[pos['row']][pos['col']]['filled']) {
            unavailable_row.add(pos['row']);
        }
    });
    // push up the new tetromino's position if its preset positions are already filled
    nextPos = nextPos.map((pos) => {
        return { ...pos, row: pos['row'] - unavailable_row.size };
    })
    // update board
    nextPos.forEach((pos) => {
        gameBoard[pos['row']][pos['col']] = { filled: true, color: nextColor, active: true, pivot: pos['pivot'] }
    });

    return {
        ...state,
        active: nextPos,
        gameBoard: gameBoard,
        activeBlockType: nextTetType,
        activeBlockOrientation: 0,
        nextTetType: Math.floor(Math.random() * 7),
        holdUsed: false
    }
}

/**
 * Returns an empty game board. 
 */
export function getCleanBoard() {
    const cleanBoard = [];
    for (let r = 0; r < 40; r++) {
        cleanBoard.push([]);
        for (let c = 0; c < 10; c++) {
            cleanBoard[r].push(
                { filled: false, color: "#2C2726", active: false, pivot: false }
            );
        }
    }
    return cleanBoard;
} 

///////////////////////////////////////////////////////////////////////////////
// Functions related to handling users' keyboard inputs 
///////////////////////////////////////////////////////////////////////////////
export function drop(state, beforeClearRows, afterClearRows) {
    console.log("drop")
    let { active, gameBoard, activeBlockType } = state;
    let board = gameBoard;
    active.sort((a, b) => { return a['row'] - b['row'] });
    for (let pos of active) {
        const row = pos['row'];
        const col = pos['col'];
        // cannot drop anymore
        if (row === 39 || // 1. current tet reached the ground
            (!board[row + 1][col]['active'] && board[row + 1][col]['filled']) // 2. current tet reached another inactive tet
            ) {
            // turn this collection of blocks (and this collection ONLY) to inactive,
            for (let pos of active) {
                board[pos['row']][pos['col']]['active'] = false
            }
            const gameOver = checkGameOver(board); 
            let st;
            if (gameOver) {
                // TODO: clean the board. 
                // TODO: KOed. tell the opponent. 
                st = {...state, gameBoard: getCleanBoard(), active: [
                    { row: -1, col: -1, pivot: false },
                    { row: -1, col: -1, pivot: false },
                    { row: -1, col: -1, pivot: false },
                    { row: -1, col: -1, pivot: false }
                ],
                activeBlockType: null,
                activeBlockOrientation: 0,};
            } else {
                st = beforeClearRows({...state, gameBoard: board})
                st = clearRows(st)
                st = afterClearRows(st)
            }
            return releaseNextTetromino(st);
        }
    }

    // All positions clear. the block can move down. 
    // active ones => inactive
    let color = tetrominoTypeToColor(activeBlockType);
    board = currActiveToInactive(board, active);
    // new positions => active
    for (let pos of active) {
        board[pos['row'] + 1][pos['col']] =
            { filled: true, color: color, active: true, pivot: pos['pivot'] };
    }
    return {
        ...state,
        gameBoard: board,
        active: active.map((e) => { e['row'] = e['row'] + 1; return e; })
    };

}

export function holdOrExchange(state) {
    let { holdUsed, heldBlock, gameBoard, activeBlockType, nextTetType, active } = state
    if (!holdUsed) {
        // Exchange
        // make current active to inactive 
        let board = currActiveToInactive(gameBoard, active);

        if (heldBlock !== null) {
            const newActive = tetrominoTypeToNextPos(heldBlock);
            const newColor = tetrominoTypeToColor(heldBlock);
            // make new position depending on [heldBlock] active
            board = currInactiveToActive(board, newActive, newColor);
            // update currBlockType, currBlockOrientation, heldBlock, holdUsed, active, board
            return {
                ...state,
                activeBlockType: heldBlock,
                activeBlockOrientation: 0,
                heldBlock: activeBlockType,
                holdUsed: true,
                active: newActive,
                board: board,
            }
        }
        // Very First Hold
        else {
            // heldBlock, holdUsed, active, board
            const nextTetromino = nextTetType
            const newActive = tetrominoTypeToNextPos(nextTetromino);
            const newColor = tetrominoTypeToColor(nextTetromino);
            board = currInactiveToActive(board, newActive, newColor);
            return {
                ...state,
                activeBlockType: nextTetromino,
                activeBlockOrientation: 0,
                heldBlock: activeBlockType,
                holdUsed: true,
                active: newActive,
                board: board,
            }
        }
    }
}

export function moveLeft(state) {
    let { active, gameBoard } = state
    let canMove = true;
    let dir_int = -1;

    // check if the block can move
    for (let pos of active) {
        const row = pos['row'];
        const col = pos['col'];
        // running into the wall or a left neighbor
        if (col === 0 || (!gameBoard[row][col + dir_int]['active'] && gameBoard[row][col + dir_int]['filled'])) {
            canMove = false;
        }
    }

    // move or not
    if (canMove) {
        // All positions clear. the block can move. 
        active.sort((a, b) => { return a['col'] - b['col'] }); // sort the active block positions w.r.t the column number in ASCENDING order.    
        for (let pos of active) {
            let prev_color = gameBoard[pos['row']][pos['col']]['color'];
            let prev_pivot = gameBoard[pos['row']][pos['col']]['pivot'];
            gameBoard[pos['row']][pos['col']] = { filled: false, color: "#2C2726", active: false, pivot: false };
            gameBoard[pos['row']][pos['col'] + dir_int] = { filled: true, color: prev_color, active: true, pivot: prev_pivot };
        }
        return {
            ...state,
            gameBoard: gameBoard,
            active: active.map((e) => {
                e['col'] = e['col'] + dir_int; return e;
            })
        };
    }
    return state;

}

export function moveRight(state) {
    let { active, gameBoard } = state
    let canMove = true;
    let dir_int = 1;

    // check if the block can move
    for (let pos of active) {
        const row = pos['row'];
        const col = pos['col'];
        // running into the wall or a left neighbor
        if (col === 9 || (!gameBoard[row][col + dir_int]['active'] && gameBoard[row][col + dir_int]['filled'])) {
            canMove = false;
        }
    }

    // move or not
    if (canMove) {
        // All positions clear. the block can move. 
        active.sort((a, b) => { return b['col'] - a['col'] }); // sort the active block positions w.r.t the column number in DESCENDING order.    
        for (let pos of active) {
            let prev_color = gameBoard[pos['row']][pos['col']]['color'];
            let prev_pivot = gameBoard[pos['row']][pos['col']]['pivot'];
            gameBoard[pos['row']][pos['col']] = { filled: false, color: "#2C2726", active: false, pivot: false };
            gameBoard[pos['row']][pos['col'] + dir_int] = { filled: true, color: prev_color, active: true, pivot: prev_pivot };
        }
        return {
            ...state,
            gameBoard: gameBoard,
            active: active.map((e) => {
                e['col'] = e['col'] + dir_int; return e;
            })
        };
    }
    return state;
}

export function rotate(state) {
    let { gameBoard, active, activeBlockType, activeBlockOrientation } = state;
    // TODO: should probably be a constant 
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
        if (gameBoard[pos['row']][pos['col']]['pivot']) {
            pivot = pos;
        }
    }

    // check if we can rotate
    // not the square one :)
    if (!pivot) {
        return state;
    }

    let next_pos = next_pos_dict[activeBlockType][activeBlockOrientation];

    // get new positions
    let new_active = []
    for (let pos of next_pos) {
        let row = pivot['row'] + pos['row'];
        let col = pivot['col'] + pos['col'];
        new_active.push({ row: row, col: col, pivot: pos['pivot'] });
    }

    // check for wall kick 
    var wallKickRow = 0;
    var wallKickColLeft = 0;
    var wallKickColRight = 0;
    for (let pos of new_active) {
        let row = pos['row'];
        let col = pos['col'];
        if (row > 39) {
            wallKickRow = Math.max(wallKickRow, row - 39);
        }
        if (col < 0) {
            wallKickColLeft = Math.max(wallKickColLeft, -col);
        }
        else if (col > 9) {
            wallKickColRight = Math.max(wallKickColRight, col - 9);
        }
    }

    if (wallKickRow || wallKickColLeft || wallKickColRight) {
        new_active.forEach((curr, i, arr) => {
            arr[i] = {
                row: curr['row'] - wallKickRow,
                col: curr['col'] + wallKickColLeft - wallKickColRight,
                pivot: curr['pivot']
            };
        });
    }

    // if any of the new positions after the rotation is filled, return
    for (let pos of new_active) {
        let row = pos['row'];
        let col = pos['col'];
        if (!gameBoard[row][col]['active'] && gameBoard[row][col]['filled']) {
            return state;
        }
    }
    // rotate
    // active ones => inactive
    let color = tetrominoTypeToColor(activeBlockType);
    gameBoard = currActiveToInactive(gameBoard, active);

    // new positions => active
    for (let pos of new_active) {
        let row = pos['row'];
        let col = pos['col'];
        gameBoard[row][col] = { filled: true, color: color, active: true, pivot: pos['pivot'] };
    }

    const nextOrientation = activeBlockOrientation === 3 ? 0 : activeBlockOrientation + 1;

    return {
        ...state,
        gameBoard: gameBoard,
        active: new_active,
        activeBlockOrientation: nextOrientation,
    };
}

export function handleSpaceInput(state) {
    let ghostPieceSet = ghostPiece(state);
    let { gameBoard, activeBlockType, nextTetType, combo, active } = state;
    const board = currActiveToInactive(gameBoard, active);
    const blockColor = tetrominoTypeToColor(activeBlockType);

    // inactive ones => active 
    let newActive = [];
    ghostPieceSet.forEach((pos) => {
        const row = Math.floor(Number(pos) / 10);
        const col = Number(pos) % 10;
        board[row][col] = { filled: true, color: blockColor, active: true, pivot: false };
        newActive.push({ row: row, col: col, pivot: false });
    })

    // make drop sound
    dropSound.play()

    return {
        ...state,
        gameBoard: board,
        active: newActive
    };
}

export function pauseOrResume(state, timer) {
    let { isPaused, softDropTimer }  = state;
    if (isPaused) {
        softDropTimer = timer;
    }
    else {
        clearInterval(softDropTimer);
    }
    return {...state, isPaused: !isPaused, softDropTimer}
}

