/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Accordion, Button, Col, Form, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { fetchBuildings, fetchSchedulesByZone } from '../api';

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const slots = ["9-11", "11-13", "13-15", "15-17"];

const zoneMap = {
  A: [1, 18, 24, 4, 7, 3, 5, 17],
  B: [8, 11, 9, 27, 13, 6],
  C: [30, 20, 19, 12, 25],
  D: [2, 15, 16],
  E: [10, 21, 22], 
  F: [29, 28, 26, 14]
};

const AllScheduleTable = ({ setHighlightedBuildings }) => {
  const location = useLocation();
  const userId = location.state?.userId;
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [allScheduleData, setSchedule] = useState({});
  const [selectedWeek, setSelectedWeek] = useState();
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key state
  
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
    setSelectedWeek(getCurrentWeek());
    console.log("Current week:", getCurrentWeek());
    const loadAll = async () => {
      const [buildingData, scheduleData] = await Promise.all([
        fetchBuildings(),
        fetchSchedulesByZone(selectedWeek)
      ]);

      setBuildings(buildingData);

      const formatted = {};

      for (const entry of scheduleData) {
        const { Day, Slot, buildingId, userId, FullName } = entry;

        const zone = Object.entries(zoneMap).find(([_, ids]) =>
          ids.includes(buildingId)
        )?.[0];
        if (!zone) continue;

        if (!formatted[Day]) formatted[Day] = {};
        if (!formatted[Day][Slot]) formatted[Day][Slot] = {};
        if (!formatted[Day][Slot][zone]) formatted[Day][Slot][zone] = [];

        formatted[Day][Slot][zone].push({
          id: userId,
          name: FullName,
          buildingId
        });
      }

      setSchedule(formatted);
    };

    loadAll();
  }, [setHighlightedBuildings, selectedWeek, userId, refreshKey]);

const handleSlotClick = (day, slot) => {
    const slotData = allScheduleData[day]?.[slot] || {};
    const buildingIds = [];

    for (const zone of Object.keys(slotData)) {
        for (const entry of slotData[zone]) {
            const buildingIdStr = String(entry.buildingId);
            if (!buildingIds.includes(buildingIdStr)) {
                buildingIds.push(buildingIdStr);
            }
        }
    }
    console.log("buildingIds", buildingIds);

    setHighlightedBuildings(buildingIds);
};

  const onUserClick = (e, buildingId) => {
    e.stopPropagation(); 
    setSelectedBuildingId(buildingId);
  };

  return (
    <Row>
      <Col>
        <h4 className="mb-3">University Schedule</h4>
        <h5 className="mb-3">Click on a time slot to view map locations</h5>
        <div className="d-flex align-items-center mb-3">
          <Form className="me-3 flex-grow-1">
            <Form.Group as={Row} controlId="formWeek">
              <Form.Label column sm="2" className="fw-bold">
                Select week:
              </Form.Label>
              <Col sm="7">
                <div style={{ position: 'relative', maxWidth: 200 }}>
                  <Form.Control
                    type="week"
                    style={{ height: '38px', cursor: 'pointer', width: 170 }}
                    value={selectedWeek || ""}
                    onChange={e => setSelectedWeek(e.target.value)}
                  />
                </div>
              </Col>
            </Form.Group>
          </Form>
          <Button
            variant="outline-primary"
            onClick={() => setRefreshKey(prev => prev + 1)}
            style={{ height: '38px' }}
            title="Refresh Table"
          >
            &#x21bb; Refresh
          </Button>
        </div>
        <Accordion defaultActiveKey="0" alwaysOpen>
          {days.map((day, index) => (
            <Accordion.Item eventKey={index.toString()} key={day} className="mb-3">
              <Accordion.Header>{day}</Accordion.Header>
              <Accordion.Body className="p-0">
                <table className="table table-bordered mb-0 text-center text-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Time</th>
                      {Object.keys(zoneMap).map(zone => (
                        <th key={zone}>Zone {zone}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map(slot => (
                      <tr
                        key={slot}
                        onClick={() => handleSlotClick(day, slot)}
                        style={{ cursor: "pointer" }}
                      >
                        <td
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                            color: "#60225E",
                            fontWeight: "bold",
                            background: "#e7f1ff"
                          }}
                          title="Click to highlight buildings on map"
                          onMouseOver={e => (e.currentTarget.style.background = "#cfe2ff")}
                          onMouseOut={e => (e.currentTarget.style.background = "#e7f1ff")}
                        >
                          {slot}
                        </td>
                        {Object.keys(zoneMap).map(zone => {
                          const usersInZone = allScheduleData[day]?.[slot]?.[zone] || [];
                          return (
                            <td key={zone}>
                              {usersInZone.length ? (
                                usersInZone.map(u => (
                                  <div
                                    key={u.id}
                                    style={{
                                      cursor: "pointer",
                                      color: "#007bff"
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent row click
                                      onUserClick(e, u.buildingId);
                                    }}
                                  >
                                    {u.name}
                                  </div>
                                ))
                              ) : (
                                "—"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Col>
    </Row>
  );
};
  

export default AllScheduleTable;
