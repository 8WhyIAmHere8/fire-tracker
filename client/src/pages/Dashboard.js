/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

import { fetchBuildings, fetchSchedules } from '../api.js';
import InlineMap from '../components/Map.js';
import ScheduleTable from '../components/personalScheduleTable.js';
import AllScheduleTable from '../components/AllScheduleTable.js';

const Dashboard = () => {
  const location = useLocation();
  const userId = location.state?.userId;

  const [buildings, setBuildings] = useState([]);
  const [highlightedBuildings, setHighlightedBuildings] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (userId) loadSchedules();
    loadBuildings();
  }, [userId]);

  const loadBuildings = async () => {
    const data = await fetchBuildings();
    setBuildings(data);
  };

  const loadSchedules = async () => {
    const data = await fetchSchedules(userId);
    setSchedules(data);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <Container fluid className="py-4" style={{ minHeight: "100vh" }}>
      <Row className="justify-content-center">
        {/* Left Column */}
        <Col md={5} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">My Dashboard</h4>
                <Button variant="primary" className="Button" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
              <h5 className="mt-4 mb-3">My Weekly Schedule</h5>
              <ScheduleTable />
              <h5 className="mt-4 mb-3">Map</h5>
              <InlineMap highlightedBuildings={highlightedBuildings} />
            </Card.Body>
          </Card>
        </Col>
        {/* Right Column */}
        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">All Schedules</h5>
              <AllScheduleTable setHighlightedBuildings={setHighlightedBuildings} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
