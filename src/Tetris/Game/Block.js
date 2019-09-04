import React from 'react';

function Block(props) {
    const color = props.pivot ? "white" : props.color;
    const active = props.active ? 'A' : '';
    return (
        <div className="block" style={{ backgroundColor: color }}>{active}</div>
    );
}

export default Block;