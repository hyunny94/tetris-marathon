import React from 'react';

function Register(props) {
    return (
        <form>
            <label>
                Nickname:
                <input type="text" name="nickname" onChange={props.handleNameChange} />
            </label>

            <button onClick={props.handleRegister}> Play </button>
        </form>
    );
}

export default Register;