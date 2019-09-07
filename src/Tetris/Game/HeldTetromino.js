import React from 'react';
import Block from './Block';

function HeldTetromino(props) {
    const color = props.color;
    const pos = props.pos;

    let heldTet = [];
    for (let r = 0; r < 4; r++) {
        let newRow = [];
        for (let c = 0; c < 4; c++) {
            newRow.push(<Block color="#2C2726" />)
        }
        heldTet.push(newRow);
    }
    if (typeof props.color !== "undefined") {
        pos.forEach((p) => {
            heldTet[p['row'] - 19][p['col'] - 3] = <Block color={color} />;
        });
    }

    return (
        <div className="heldTetBoardContainer">
            <h1>Hold:</h1>
            <div className="tetBoard">
                {heldTet}
            </div>
        </div>
    );
}

export default HeldTetromino;