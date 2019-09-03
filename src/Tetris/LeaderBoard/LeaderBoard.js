import React from 'react';
import Leader from './Leader';
import ChallengeButton from './ChallegeButton';
import './leaderBoard.css';

function LeaderBoard(props) {

    const leaders = [];

    for (let leader of props.leaders) {
        leaders.push(<Leader leader={leader} />);
    }

    return (
        <div className="leaderBoard">
            <h1> Leader Board </h1>
            <table>
                <thead>
                    <tr>
                        <td>Name</td> <td>Score</td>
                    </tr>
                </thead>
                <tbody>
                    {leaders}
                </tbody>
            </table>
            <ChallengeButton handleGameStart={props.handleGameStart} />
        </div>
    );
}

export default LeaderBoard;
