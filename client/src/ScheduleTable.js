import React, { useEffect, useState } from 'react';
import { fetchBuildings } from './api';

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const slots = ["9-11", "11-13", "13-15", "15-17"];


const ScheduleTable = () => {
    const [buildings, setBuildings] = useState([]);
  const [schedule, setSchedule] = useState(() =>
    Object.fromEntries(days.map(day => [
      day, Object.fromEntries(slots.map(slot => [slot, null]))
    ]))
  );

const loadBuildings = async () => {
      const data = await fetchBuildings();
      setBuildings(data);}

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
    setEditing(null);
  };

    useEffect(() => {
      
      loadBuildings();
    });
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full border border-gray-300 text-sm text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Day / Time</th>
            {slots.map(slot => (
              <th key={slot} className="p-2 border">{slot}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td className="p-2 border font-medium">{day}</td>
              {slots.map(slot => {
                const isEditing = editing && editing.day === day && editing.slot === slot;
                const currentValue = schedule[day][slot];

                return (
                  <td
                    key={slot}
                    className="p-2 border hover:bg-gray-50 cursor-pointer relative"
                    onClick={() => setEditing({ day, slot })}
                  >
                    {isEditing ? (
                      <select
                        autoFocus
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
                        ? buildings.find(b => b.id === currentValue)?.name || currentValue
                        : "—"
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
