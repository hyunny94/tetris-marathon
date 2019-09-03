import React from 'react';
import Score from './Score';
import PlayTime from './PlayTime';

function ScoreBoard(props) {
    return (
        <div className="scoreBoard">
            {/* <NextBlock nextBlock={props.nextBlock} /> */}
            <Score score={props.score} />
            <PlayTime time={props.time} />
        </div>
    );
}

export default ScoreBoard;