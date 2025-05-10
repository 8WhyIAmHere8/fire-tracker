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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      user_id: userId,
      building_id: building,
      start_time: startTime,
      end_time: endTime
    };

    const result = await createSchedule(data);
    if (result.message) {
      alert("Schedule added!");
      loadSchedules();
    } else {
      alert("Error adding schedule");
    }
  };

  const handleBuildingClick = (buildingId) => {
    setBuilding(buildingId);
    setSelectedBuilding(buildingId);
  };

  return (
    <Row className="p-4">
      {/* Left Column */}
      <Col md={4}>
        <h4 className="mb-3">My Weekly Schedule</h4>
        <ScheduleTable />

        <h5 className="mt-4">Schedule Location</h5>
        

        <h5 className="mt-4">Map</h5>
        <InlineMap
  selectedId={selectedBuilding}
  onSelectBuilding={handleBuildingClick}
  highlightedBuildings={highlightedBuildings}
/>


        <h6 className="mt-4">My Scheduled Locations</h6>
        <ul>
          {schedules.map(s => (
            <li key={s.id}>
              <strong>{s.building_name}</strong>: {new Date(s.start_time).toLocaleString()} – {new Date(s.end_time).toLocaleString()}
            </li>
          ))}
        </ul>
      </Col>

      {/* Right Column */}
      <AllScheduleTable />
    </Row>
  );
};

export default Dashboard;
