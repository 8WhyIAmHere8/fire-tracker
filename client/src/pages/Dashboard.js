/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { fetchBuildings, fetchSchedules } from '../api.js';
import AllScheduleTable from '../components/AllScheduleTable.js';
import InlineMap from '../components/Map.js';
import ScheduleTable from '../components/personalScheduleTable.js';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [buildings, setBuildings] = useState([]);
  const [highlightedBuildings, setHighlightedBuildings] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [schedules, setSchedules] = useState([]);

  const getCurrentWeek = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const dayOfWeek = jan4.getUTCDay() || 7;
    const firstThursday = new Date(jan4);
    firstThursday.setUTCDate(jan4.getUTCDate() + (4 - dayOfWeek));
    const currentThursday = new Date(now);
    const currentDay = currentThursday.getUTCDay() || 7;
    currentThursday.setUTCDate(currentThursday.getUTCDate() + (4 - currentDay));
    const weekNumber = Math.floor(
      (currentThursday - firstThursday) / (7 * 24 * 60 * 60 * 1000)
    ) + 1;
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
     if (!userId || !token) {
      navigate('/');
    }
    const fetchData = async () => {
      if (userId) {
        const week = getCurrentWeek();
        const scheduleData = await fetchSchedules(week, userId);
        setSchedules(scheduleData);
      }
      const buildingData = await fetchBuildings();
      setBuildings(buildingData);
    };
    fetchData();
  }, [userId, token, navigate]);

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
              <AllScheduleTable setHighlightedBuildings={setHighlightedBuildings} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
