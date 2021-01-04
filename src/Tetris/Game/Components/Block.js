import React from 'react';

function Block(props) {
    const borderColor = props.ghost ? props.ghostColor : "#574D4B";

    return (
        <div className="block" style={{ backgroundColor: props.color, borderColor }}></div>
    );
}

export default Block;