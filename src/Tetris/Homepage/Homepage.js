import React from 'react';
import Leader from './Leader';
import ChallengeButton from './ChallegeButton';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

/**
 * homepage has
 * - Kyothrees name and welcome remarks
 *
 * - leaders board
 * - updates for the users
 * - submit a suggestion button which leads to form submission routine that emails to hj283@cornell.edu
 *
 * - Play button that leads to register + help
 *
 *
 */


function Homepage(props) {

    const leaders = props.leaders.map((leader, index) => {
        return <Leader rank={index + 1} leader={leader} key={index} />
    });

    return (
        <Container style={{ display: "block" }}>
            <Row style={{ textAlign: "center" }}> {/** row1: intro */}
                <Col>
                    <h1> Kyothrees </h1>
                    <p> Thank you for visiting this website and playing a game of Kyothrees. </p>
                </Col>
            </Row>
            <Row> {/** row2: leaderboard, updates, form */}
                <Col>
                    <h1> Leader Board </h1>
                    <table>
                        <thead>
                            <tr>
                                <td>Rank</td>
                                <td>Name</td>
                                <td>Score</td>
                            </tr>
                        </thead>
                        <tbody>
                            {leaders}
                        </tbody>
                    </table>
                </Col>
                <Col> {/** updates */}
                    <h1> Updates to the game </h1>
                    <ul>
                        <li>wall-kicks (where blocks can rotate off the walls) are enabled.</li>
                        <li>lock delays (which allows you to rotate/move the block
                        certain amount of times after it reaches bottom)
                        are enabled.</li>
                    </ul>
                </Col>
                <Col> {/** forms */}
                    <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdcsMLebG8RYVc3k0TdGw4X0sDKzZmJN47k_vWJXE2queDJtQ/viewform?embedded=true" width="640" height="461" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
                </Col>
            </Row>

            <Row style={{ textAlign: "center" }}> {/** Play button */}
                <Col>
                    <ChallengeButton handleGameStart={props.handleInitialGameStart} />
                </Col>

            </Row>
        </Container>
    );

}

export default Homepage;


