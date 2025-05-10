const API_BASE_URL = "http://localhost:5000";

export async function fetchHealthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error(" Error fetching API health check:", error);
    return "Error connecting to backend";
  }
}

export async function registerUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        });
    console.log(response);
    return response.json();
}

export async function loginUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        });
    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("token", data.token);
    }
    return data;
}
export async function createSchedule(entries) {
  const res = await fetch(`${API_BASE_URL}/api/scheduleEntries/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entries),
  });
  return res.json();
}

export async function fetchSchedules(week, userId) {
  const res = await fetch(`${API_BASE_URL}/api/scheduleEntries/${userId}/${week}`);
  return res.json();
}
export async function fetchSchedulesByZone(week) {
  const res = await fetch(`${API_BASE_URL}/api/scheduleEntries/zones/${week}`);
  return res.json();
}
export async function fetchBuildings() {
  const res = await fetch(`${API_BASE_URL}/api/buildings`);
  return res.json();
}