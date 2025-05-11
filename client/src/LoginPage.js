import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, fetchHealthCheck } from './api';
import dawg from './logo.png';

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [backendMessage, setBackendMessage] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    async function getBackendMessage() {
      const message = await fetchHealthCheck();
      setBackendMessage(message);
    }
    getBackendMessage();
  }, []);
  const handleRegister = async () => {
   navigate('/register');
  };

  const handleLogin = async () => {
    const response = await loginUser(username, password);
    if (response.token) {
      alert("Login successful! id: " + response.userId);
      navigate('/dashboard', { state: { userId: response.userId } });
    } else {
      alert("Login failed!");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={dawg}  alt="logo" />
        <p>Fire Warden Tracker</p>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleRegister}>Register</Button>
          <Button onClick={handleLogin}>Login</Button>
        </div>
      </header>
    </div>
  );
}

export default LoginPage;
