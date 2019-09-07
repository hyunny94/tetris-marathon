import React from 'react';
import Block from './Block';

function NextTetromino(props) {
    const color = props.color;
    const pos = props.pos;

    let nextTet = [];

    for (let r = 0; r < 4; r++) {
        let newRow = [];
        for (let c = 0; c < 4; c++) {
            newRow.push(<Block color="lightgray" />)
        }
        nextTet.push(newRow);
    }

    pos.forEach((p) => {
        nextTet[p['row'] - 19][p['col'] - 3] = <Block color={color} />;
    });

    return (
        <div className="nextTetBoardContainer">
            <h1>Next:</h1>
            <div className="nextTetBoard">
                {nextTet}
            </div>
        </div>
    );
}

export default NextTetromino;