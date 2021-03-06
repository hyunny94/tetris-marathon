import React from 'react';

function Register(props) {
    return (
        <div>
            <form>
                <label>
                    Nickname:
                <input type="text" name="nickname" onChange={props.handleNameChange} />
                </label>

                {/* <button onClick={props.handleRegister}> Play </button> */}
            </form>
            <div>
                <h1>Move Left: left arrow</h1>
                <h1>Move Right: right arrow</h1>
                <h1>Soft drop: down arrow</h1>
                <h1>Hard drop: space</h1>
                <h1>Rotate: up arrow</h1>
                <h1>Hold: shift</h1>
                <h1>Pause: p</h1>

                <button onClick={props.handleTetrisMarathonStart}> Play Tetris Marathon </button>
                <button onClick={props.playTetrisBattleWithSomeone}> Play Tetris Battle With Someone </button>
                {/* <button onClick={props.handleGameStart}> Play Tetris Battle With A Friend </button> */}
            </div>
        </div>
    );
}

export default Register;