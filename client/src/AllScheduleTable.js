import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createSchedule, fetchBuildings, fetchSchedulesByZone } from './api';
import { Col, Row, Card } from 'react-bootstrap';
import InlineMap from './Map'; // Make sure this import matches your file structure

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const slots = ["9-11", "11-13", "13-15", "15-17"];

const zoneMap = {
  A: [1, 18, 24, 4, 7, 3, 5, 17],
  B: [8, 11, 9, 27, 13, 6],
  C: [30, 20, 19, 12, 25],
  D: [2, 15, 16],
  E: [10, 13, 21, 22],
  F: [29, 28, 26, 14]
};

const AllScheduleTable = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [allScheduleData, setSchedule] = useState(() =>
    Object.fromEntries(days.map(day => [
      day, Object.fromEntries(slots.map(slot => [slot, null]))
    ]))
  );

  const loadBuildings = async () => {
    const data = await fetchBuildings();
    setBuildings(data);
  };

  const loadSchedules = async () => {
    const week = "2025-W20";
    const rawData = await fetchSchedulesByZone(week);

    const formatted = {};

    for (const entry of rawData) {
      const { Day, Slot, buildingId, userId, FullName } = entry;

      const zone = Object.entries(zoneMap).find(([_, ids]) => ids.includes(buildingId))?.[0];
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

  useEffect(() => {
    loadBuildings();
    loadSchedules();
  }, []);

  const onUserClick = (buildingId) => {
    setSelectedBuildingId(buildingId);
  };

  return (
    <Row>
      <Col md={7}>
        <h4 className="mb-3">University Schedule</h4>
        <Row>
          {days.map(day => (
            <Col key={day} md={6} className="mb-4">
              <Card>
                <Card.Header>{day}</Card.Header>
                <Card.Body className="p-0">
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
                        <tr key={slot}>
                          <td>{slot}</td>
                          {Object.keys(zoneMap).map(zone => {
                            const usersInZone = allScheduleData[day]?.[slot]?.[zone] || [];
                            return (
                              <td key={zone}>
                                {usersInZone.length ? (
                                  usersInZone.map(u => (
                                    <div
                                      key={u.id}
                                      style={{ cursor: "pointer", color: "#007bff" }}
                                      onClick={() => onUserClick(u.buildingId)}
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
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      <Col md={5}>
        <h4 className="mb-3">Where is this person?</h4>
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <InlineMap
            onSelectBuilding={() => {}}
            selectedId={selectedBuildingId}
          />
        </div>
      </Col>
    </Row>
  );
};

export default AllScheduleTable;
