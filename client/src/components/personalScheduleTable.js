import { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { createSchedule, fetchBuildings, fetchSchedules, updateUserInfo, fetchUserInfo } from '../api';

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const slots = ["9-11", "11-13", "13-15", "15-17"];

const ScheduleTable = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const [selectedWeek, setSelectedWeek] = useState( );
  const [buildings, setBuildings] = useState([]);
  const [schedule, setSchedule] = useState(() =>
    Object.fromEntries(days.map(day => [
      day, Object.fromEntries(slots.map(slot => [slot, null]))
    ]))
  );
  const [editing, setEditing] = useState(null);
  const [userInfo, setUserInfo] = useState({ FullName: "", staffNumber: "" });
  const [editingUser, setEditingUser] = useState(false);

  const loadBuildings = async () => {
    const data = await fetchBuildings();
    setBuildings(data);
  };
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

  const handleChange = (e) => {
    const { value } = e.target;
    setSchedule(prev => ({
      ...prev,
      [editing.day]: {
        ...prev[editing.day],
        [editing.slot]: value
      }
    }));
    setEditing(null);
  };

  const handleDeleteAll = async () => {
    const week = selectedWeek;
    console.log("Deleting schedule for week:", week);
    const entries = [];
    for (const day of days) {
      for (const slot of slots) {
        entries.push({
          week,
          day,
          slot,
          userId,
          buildingId: null,
        });
      }
    }

    const result = await createSchedule(entries);

    // Reload schedule from backend after deletion
    const data = await fetchSchedules(week, userId);
    setSchedule(data);

    if (result.message) {
      alert("Schedule deleted!");
    } else {
      alert("Error deleting schedule");
    }
  };

  const handleSave = async () => {
    const week = selectedWeek;
    const entries = [];
    for (const day of Object.keys(schedule)) {
      for (const slot of Object.keys(schedule[day])) {
        const buildingId = schedule[day][slot];
        if (buildingId) {
          entries.push({
            week,
            day,
            slot,
            userId,
            buildingId,
          });
        }
      }
    }
    const result = await createSchedule(entries);
    if (result.message) {
      alert("Schedule added!");
    } else {
      alert("Error adding schedule");
    }
  };

 
  
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleUserInfoSave = async () => {
    const result = await updateUserInfo(userId, userInfo.FullName, userInfo.staffNumber);
    if (result.message) {
      alert("User info updated!");
      setEditingUser(false);
    } else {
      alert("Error updating user info");
    }
  };

  useEffect(() => {
    setSelectedWeek(getCurrentWeek());
    console.log("Current week:", getCurrentWeek());
    fetchUserInfo(userId).then(data => setUserInfo({ FullName: data.FullName, staffNumber: data.staffNumber }));
    console.log("User info:", userId, fetchUserInfo(userId));
  }, []);

  useEffect(() => {
    const loadSchedules = async () => {
      if (!selectedWeek || !userId) return;
      const data = await fetchSchedules(selectedWeek, userId);
      setSchedule(data);
    };
    loadBuildings();
    loadSchedules();
  }, [selectedWeek, userId]);

  return (
    <div>
      <div className="mb-3">
        {editingUser ? (
          <Form as={Row} className="align-items-center">
            <Col sm="4">
              <Form.Control
                name="FullName"
                value={userInfo.FullName}
                onChange={handleUserInfoChange}
                placeholder="Full Name"
              />
            </Col>
            <Col sm="3">
              <Form.Control
                name="staffNumber"
                value={userInfo.staffNumber}
                onChange={handleUserInfoChange}
                placeholder="Staff Number"
              />
            </Col>
            <Col sm="2">
              <Button variant="success" className="Button" size="sm" onClick={handleUserInfoSave}>Save</Button>
              <Button variant="secondary" size="sm" onClick={() => setEditingUser(false)} className="ms-2">Cancel</Button>
            </Col>
          </Form>
        ) : (
          <div>
            <span className="fw-bold">Full Name:</span> {userInfo.FullName} &nbsp;&nbsp;
            <span className="fw-bold">Staff Number:</span> {userInfo.staffNumber} &nbsp;&nbsp;
            <Button variant="outline-primary" size="sm" onClick={() => setEditingUser(true)}>Edit</Button>
          </div>
        )}
      </div>
      <Form className="mb-3">
      <Form.Group as={Row} controlId="formWeek">
  <Form.Label column sm="2" className="fw-bold">
    Select week:
  </Form.Label>
  <Col sm="7">
    <div style={{ position: 'relative', maxWidth: 200 }}>
              <Form.Control
                type="week"
                style={{ height: '38px', cursor: 'pointer', width: 170}}
                value={selectedWeek || ""}
                onChange={e => setSelectedWeek(e.target.value)}
              />
            </div>
  </Col>
</Form.Group>

      </Form>
      <div className="table-responsive mb-3">
        <Table bordered hover size="sm" className="text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Time/Day</th>
              {days.map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => (
              <tr key={slot}>
                <td className="fw-bold">{slot}</td>
                {days.map(day => {
                  const isEditing = editing && editing.day === day && editing.slot === slot;
                  const currentValue = schedule[day][slot];
                  return (
                    <td
                      key={day}
                      style={{ cursor: "pointer", minWidth: 100 }}
                      onClick={() => setEditing({ day, slot })}
                    >
                      {isEditing ? (
                        <Form.Select
                          autoFocus
                          size="sm"
                          onChange={handleChange}
                          onBlur={() => setEditing(null)}
                          defaultValue={currentValue || ""}
                        >
                          <option value="">— Clear —</option>
                          {buildings.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </Form.Select>
                      ) : (
                        currentValue
                          ? buildings.find(b => String(b.id) === String(currentValue))?.name || currentValue
                          : <span className="text-muted">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="d-flex justify-content-end gap-2">
        <Button variant="primary" className="Button" onClick={handleSave}>
          Save Schedule
        </Button>
        <Button variant="danger" className="Button" onClick={handleDeleteAll}>
          Delete Schedule
        </Button>
      </div>
    </div>
  );
};

export default ScheduleTable;
