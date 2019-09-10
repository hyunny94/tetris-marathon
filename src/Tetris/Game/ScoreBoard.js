import React from 'react';
import Score from './Score';
import PlayTime from './PlayTime';
import NextTetromino from './NextTetromino';
import HeldTetromino from './HeldTetromino';

function ScoreBoard(props) {
    return (
        <div className="scoreBoard">
            {/* <NextTetromino nextTetromino={props.nextTetromino} /> */}
            <Score score={props.score} />
            <PlayTime level={props.level} />
            <NextTetromino color={props.nextTetColor} pos={props.nextTetPos} />
            <HeldTetromino color={props.heldTetColor} pos={props.heldTetPos} />
        </div>
    );
}

export default ScoreBoard;