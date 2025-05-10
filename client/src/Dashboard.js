import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap';

import AllScheduleTable from './AllScheduleTable.js';
import InlineMap from './Map.js';
import ScheduleTable from './personalScheduleTable.js';
import { createSchedule, fetchBuildings, fetchSchedules } from './api';

const Dashboard = () => {
  const location = useLocation();
  const userId = location.state?.userId;

  const [buildings, setBuildings] = useState([]);
  const [building, setBuilding] = useState('');
  const [highlightedBuildings, setHighlightedBuildings] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

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


  return (
    <Row className="p-4">
      {/* Left Column */}
      <Col md={4}>
      <Row>
        <h4 className="mb-3">My Weekly Schedule</h4>
        <ScheduleTable />
      </Row>
      <Row>
        <h5 className="mt-4">Map</h5>
        <InlineMap
        highlightedBuildings={highlightedBuildings}
      />
      </Row>
      </Col>
      <Col>
      {/* Right Column */}
      <AllScheduleTable setHighlightedBuildings={setHighlightedBuildings} />
      </Col>
    </Row>
  );
};

export default Dashboard;
