import React from 'react';
import Block from './Block';

class GameBoard extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
    }


    handleKeyboardInput(event) {
        event.preventDefault();
        if (!this.props.isPaused && event.keyCode === 32) {
            console.log("hard drop");
            const ghostPieceSet = this.ghostPiece();
            this.props.handleSpaceInput(ghostPieceSet);
        }
    }


    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyboardInput, false);
    }


    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyboardInput, false);
    }


    ghostPiece() {
        const board = this.props.gameBoard;
        let ghostPieces = this.props.active;

        // update [ghostPieces] to the location that we would drop to.
        let canDrop = true;
        while (canDrop) {
            for (let pos of ghostPieces) {
                const row = pos['row'];
                const col = pos['col'];
                // before start 
                if (row === -1) {
                    return new Set();
                }
                if (row === 39 ||
                    (!board[row + 1][col]['active'] && board[row + 1][col]['filled'])) {
                    canDrop = false;
                }
            }
            if (canDrop) {
                ghostPieces = ghostPieces.map((e) => { return { ...e, row: e['row'] + 1 }; });
            }
        }

        let ghostPieceSet = new Set();
        ghostPieces.forEach((pos) => {
            ghostPieceSet.add("" + pos['row'] + pos['col'])
        });

        return ghostPieceSet;

    }

    ghostColor() {
        const pos = this.props.active[0];
        if (pos['row'] === -1) {
            return "#2C2726";
        }
        return this.props.gameBoard[pos['row']][pos['col']]['color'];
    }

    render() {
        const gameBoard = this.props.gameBoard;
        let matrix = [];
        const ghostPieceSet = this.ghostPiece();

        for (let r = 20; r < gameBoard.length; r++) {
            let newRow = [];
            for (let c = 0; c < 10; c++) {
                let isGhostPiece = ghostPieceSet.has("" + r + c);
                newRow.push(<Block
                    ghost={isGhostPiece}
                    ghostColor={this.ghostColor()}
                    active={gameBoard[r][c]['active']}
                    pivot={gameBoard[r][c]['pivot']}
                    color={gameBoard[r][c]['color']}
                    filled={gameBoard[r][c]['filled']}
                />);
            }
            matrix.push(newRow);
        }

        return (
            <div className="gameBoard">
                {matrix}
            </div>
        );
    }
}

export default GameBoard;