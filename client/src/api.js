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
