import React from 'react';

function Block(props) {
    // const color = props.pivot ? "white" : props.color;
    const active = props.active ? 'A' : '';
    const filled = props.filled ? 'F' : '';
    const ghost = props.ghost ? 'G' : '';
    return (
        // <div className="block" style={{ backgroundColor: props.color }}>{active}{filled}{ghost}</div>
        <div className="block" style={{ backgroundColor: props.color }}></div>
    );
}

export default Block;