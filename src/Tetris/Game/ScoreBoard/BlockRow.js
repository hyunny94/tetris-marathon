import React from 'react';
import Block from '../Block';

function BlockRow(props) {
    const color = props.color;
    const pos = props.pos;

    let nextTet = [];
    for (let r = 0; r < 4; r++) {
        let newRow = [];
        for (let c = 0; c < 4; c++) {
            newRow.push(<Block color="#2C2726" />)
        }
        nextTet.push(newRow);
    }

    if (typeof props.color !== "undefined") {
        pos.forEach((p) => {
            nextTet[p['row'] - 19][p['col'] - 3] = <Block color={color} />;
        });
    }

    const className = props.text === "Next" ? "nextTetBoardContainer" : "heldTetBoardContainer";
    return (
        <div className={className}>
            <h1>{props.text}:</h1>
            <div className="tetBoard">
                {nextTet}
            </div>
        </div>
    );
}

export default BlockRow;