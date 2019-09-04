import React from 'react';
import Block from './Block';

class GameBoard extends React.Component {

    render() {
        const gameBoard = this.props.gameBoard;
        let matrix = [];

        for (let r = 20; r < gameBoard.length; r++) {
            let newRow = [];
            for (let c = 0; c < 10; c++) {
                newRow.push(<Block active={gameBoard[r][c]['active']} pivot={gameBoard[r][c]['pivot']} color={gameBoard[r][c]['color']} />);
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