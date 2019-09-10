import React from 'react';

function Help(props) {
    return (
        <div>
            <h1>Move Left: left arrow</h1>
            <h1>Move Right: right arrow</h1>
            <h1>Soft drop: down arrow</h1>
            <h1>Hard drop: space</h1>
            <h1>Rotate: up arrow</h1>
            <h1>Hold: shift</h1>
            <h1>Pause: p</h1>

            <button onClick={props.handleGameStart}> Start </button>
        </div>

    );
}

export default Help;