import React from 'react';

function Block(props) {
    const borderColor = props.ghost ? props.ghostColor : "#574D4B";
    // const borderType = props.ghost ? "solid" : "groove";

    return (
        // <div className="block" style={{ backgroundColor: props.color }}>{active}{filled}{ghost}</div>
        <div className="block" style={{ backgroundColor: props.color, borderColor }}></div>
    );
}

export default Block;