import React from 'react';

function Block(props) {
    return (
        <div className="block" style={{ backgroundColor: props.color }}></div>
    );
}

export default Block;