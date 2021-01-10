import React from 'react';
import Block from './Block';

/**
 * This component is a collection of Block components used to display
 * a single tetromino (for hold / next tet features)
 */
function SingleTetBoard(props) {
    const color = props.color;
    const pos = props.pos;

    let tet = [];
    for (let r = 0; r < 4; r++) {
        let row = [];
        for (let c = 0; c < 4; c++) {
            row.push(<Block color="#2C2726" />)
        }
        tet.push(row);
    }

    if (typeof props.color !== "undefined") {
        pos.forEach((p) => {
            tet[p['row'] - 19][p['col'] - 3] = <Block color={color} />;
        });
    }

    return (
        <div className="singleTetBoard">
            {tet}
        </div>
    );
}

export default SingleTetBoard;