import React from 'react';
import Block from './Block';

class GameBoard extends React.Component {

    render() {
        const gameBoard = this.props.gameBoard;
        const matrix = [];

        for (let r = 2; r < 22; r++) {
            matrix.push([]);
            for (let c = 0; c < 10; c++) {
                matrix[r - 2].push(<Block active={gameBoard[r][c]['active']} pivot={gameBoard[r][c]['pivot']} color={gameBoard[r][c]['color']} />);
            }
        }
        return (
            <div className="gameBoard">
                {matrix}
            </div>
        );
    }

}

export default GameBoard;