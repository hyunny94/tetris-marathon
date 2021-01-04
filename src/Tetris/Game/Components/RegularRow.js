import React from 'react';

function RegularRow(props) {
    return (
        <h1 className="regularRow"> {props.text}: {props.value} </h1>
    );
}

export default RegularRow;