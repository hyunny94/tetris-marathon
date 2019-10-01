import React from 'react';

function ChallengeButton(props) {
    return <button onClick={props.handleGameStart}> Play </button>;
}

export default ChallengeButton;