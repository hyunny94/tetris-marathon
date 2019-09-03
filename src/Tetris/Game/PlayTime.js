import React from 'react';

function PlayTime(props) {
    let hour = Math.floor(props.time / 3600);
    let min = Math.floor(props.time / 60) - 60 * hour;
    let sec = props.time % 60;
    if (hour < 10) { hour = "0" + hour; }
    if (min < 10) { min = "0" + min; }
    if (sec < 10) { sec = "0" + sec; }
    return (
        <h1> Time: {hour}:{min}:{sec} </h1>
    );
}

export default PlayTime;