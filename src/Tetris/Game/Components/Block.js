import React from 'react';

/**
 * This component is a single rectangle on the tetris game board.
 * A collection of these blocks form the main game board or 
 * a small single tet board to display held/next tetrominos.
 */
function Block(props) {
    const borderColor = props.ghost ? props.ghostColor : "#574D4B";

    return (
        <div className="block" style={{ backgroundColor: props.color, borderColor }}></div>
    );
}

export default Block;