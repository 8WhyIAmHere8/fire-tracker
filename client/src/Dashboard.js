import React, { useState, useEffect } from 'react';
import { createSchedule, fetchSchedules, fetchBuildings } from './api';
import { useLocation } from 'react-router-dom';
import InlineMap from './Map.js';
import ScheduleTable from './ScheduleTable';
const Dashboard = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const [buildings, setBuildings] = useState([]);
  const [building, setBuilding] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
 
  const loadBuildings = async () => {
    const data = await fetchBuildings();
    setBuildings(data);

  }
    const handleBuildingClick = (buildingId) => {
      console.log("Clicked building:", buildingId);
      setBuilding(buildingId); 
      setSelectedBuilding(buildingId); // Set the selected building ID
      // If you want to pre-fill the form
    };
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      user_id: userId,
      building_id: building,
      start_time: startTime,
      end_time: endTime
    };
    console.log(data);
    const result = await createSchedule(data);
    if (result.message) {
      alert("Schedule added!");
      loadSchedules();
    } else {
      alert("Error adding schedule");
    }
  };

  const loadSchedules = async () => {
    const data = await fetchSchedules(userId);
    setSchedules(data);
  };

  useEffect(() => {
    if (userId) loadSchedules();
    loadBuildings();
  }, [userId]);

  return (
    <div>
          <div>
      <h2 className="text-xl font-semibold mb-4">My Weekly Schedule</h2>
      <ScheduleTable />
    </div>

      <h2>Schedule Location</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Building:
          <select value={building} onChange={(e) => setBuilding(e.target.value)}>
  {buildings.map((b) => (
    <option key={b.id} value={b.id}>{b.name}</option>
  ))}
</select>
        </label><br/>
        <label>
          Start Time:
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </label><br/>
        <label>
          End Time:
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </label><br/>
        <button type="submit">Submit</button>
      </form>
      <div>
      <InlineMap 
      selectedId={selectedBuilding}
      onSelectBuilding={handleBuildingClick} />
      </div>
      <h3>My Scheduled Locations</h3>
      <ul>
        {schedules.map(s => (
          <li key={s.id}>
            <strong>{s.building_name}</strong>: {new Date(s.start_time).toLocaleString()} - {new Date(s.end_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
