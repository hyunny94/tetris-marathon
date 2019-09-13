import React from 'react';
import RegularRow from './RegularRow';
import BlockRow from './BlockRow';

function ScoreBoard(props) {
    return (
        <div className="scoreBoard">
            <RegularRow text={"Level"} value={props.level} />
            <RegularRow text={"Score"} value={props.score} />
            <BlockRow text={"Next"} color={props.nextTetColor} pos={props.nextTetPos} />
            <BlockRow text={"Hold"} color={props.heldTetColor} pos={props.heldTetPos} />
        </div>
    );
}

export default ScoreBoard;