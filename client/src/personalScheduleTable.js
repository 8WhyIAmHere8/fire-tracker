import React, { use, useEffect, useState } from 'react';
import { createSchedule, fetchSchedules, fetchBuildings } from './api';
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const slots = ["9-11", "11-13", "13-15", "15-17"];


const ScheduleTable = () => {
    const location = useLocation();
    const userId = location.state?.userId;
    const [selectedWeek, setSelectedWeek] = useState();
    const [buildings, setBuildings] = useState([]);
    const [schedule, setSchedule] = useState(() =>
    Object.fromEntries(days.map(day => [
      day, Object.fromEntries(slots.map(slot => [slot, null]))
    ]))
  );

  

const loadBuildings = async () => {
      const data = await fetchBuildings();
      setBuildings(data);
      
    }

  const [editing, setEditing] = useState(null); // { day, slot }

  const handleChange = (e) => {
    const { value } = e.target;
    setSchedule(prev => ({
      ...prev,
      [editing.day]: {
        ...prev[editing.day],
        [editing.slot]: value
      }
    }));
    console.log("sch", schedule)
    setEditing(null);
  };
  const loadSchedules = async () => {
    const week = selectedWeek
    const data = await fetchSchedules(week, userId);
    console.log(userId)
    console.log("data", data);
    setSchedule(data);
  };
  const handleDeleteAll = async () => {
    const week = selectedWeek
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
    console.log("entries", entries)
    const result = await createSchedule(entries);
    if (result.message) {
      alert("Schedule deleted!");
    } else {
      alert("Error deleting schedule");
    }
  };
  const handleSave = async () => {
    const week = selectedWeek; // You could calculate or allow user to pick
    
  
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
    console.log("entries", entries)
  
    const result = await createSchedule(entries);
        if (result.message) {
          alert("Schedule added!");
          
        } else {
          alert("Error adding schedule");
        }
      };
    

    useEffect(() => {
      
      loadBuildings();
      loadSchedules();
    }, []);
  return (
    <>
    <div className="p-4">
      <label className="mr-2 font-medium">Select week:</label>
      <input
        type="week"
        value={selectedWeek}
        onChange={e => setSelectedWeek(e.target.value)}
        className="border p-1 rounded"
      />
      <Button 
        onClick={loadSchedules}
        className="ml-2 bg-green-500 text-white px-4 py-2 rounded"
      >
        Load Schedule
      </Button>
    </div>
    <div className="overflow-x-auto p-4">
      <table className="w-full border border-gray-300 text-sm text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Time/Day</th>
            {days.map(day => (
              <th key={day} className="p-2 border">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot}>
              <td className="p-2 border font-medium">{slot}</td>
              {days.map(day => {
                const isEditing = editing && editing.day === day && editing.slot === slot;
                const currentValue = schedule[day][slot];

                return (
                  <td
                    key={day}
                    className="p-2 border hover:bg-gray-50 cursor-pointer relative"
                    onClick={() => setEditing({ day, slot })}
                  >
                    {isEditing ? (
                      <select
                        autoFocust
                        className="w-full text-sm p-1 border rounded"
                        onChange={handleChange}
                        onBlur={() => setEditing(null)}
                        defaultValue={currentValue || ""}
                      >
                        <option value="" disabled>Select building</option>
                        {buildings.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    ) : (
                      currentValue
                        ? buildings.find(b => String(b.id) === String(currentValue))?.name || currentValue
                        : "—"
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div><div>
        <Button
          onClick={handleSave}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Schedule
        </Button>
        <Button
          onClick={handleDeleteAll}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded ml-2"
        >
          Delet Schedule
        </Button>
      </div></>
  );
};

export default ScheduleTable;
