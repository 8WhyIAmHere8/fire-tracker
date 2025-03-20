import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from './api';
import dawg from './dawg1.jpg';

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const response = await registerUser(username, password);
    if (response.success) {
      alert("Registration successful!");
    } else {
      alert("Registration failed!");
    }
  };

  const handleLogin = async () => {
    const response = await loginUser(username, password);
    if (response.token) {
      alert("Login successful!");
      navigate('/dashboard'); //  Now useNavigate() will work correctly!
    } else {
      alert("Login failed!");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={dawg} className="App-logo" alt="logo" />
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
