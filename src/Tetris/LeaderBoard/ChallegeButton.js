import React from 'react';

function ChallengeButton(props) {
    return <button onClick={props.handleGameStart}> Start </button>;
}

export default ChallengeButton;