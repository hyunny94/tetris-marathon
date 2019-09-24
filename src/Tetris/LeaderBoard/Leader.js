import React from 'react';

function Leader(props) {
    return (
        <tr>
            <td> {props.rank} </td>
            <td> {props.leader.name} </td>
            <td> {props.leader.score} </td>
        </tr>
    );
}

export default Leader;