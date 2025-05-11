import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './api';

function RegistrationPage() {
  const [staffNumber, setStaffNumber] = useState("");
  const [username, setUsername] = useState("");
 const [FullName, setFirstName] = useState("");
 const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const response = await registerUser(username, staffNumber, FullName, password );
    if (response.success) {
      alert("Registration successful!");
      navigate('/');
    } else {
      alert("Registration failed!");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Register Fire Warden</h2>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Staff Number"
            value={staffNumber}
            onChange={(e) => setStaffNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="Name"
            value={FullName}
            onChange={(e) => setFirstName(e.target.value)}
          />
           <input
            type="text"
            placeholder="password"
            value= {password}
            onChange={(e) => setPassword(e.target.value)}
          />


          <Button onClick={handleRegister}>Register</Button>
        </div>
      </header>
    </div>
  );
}

export default RegistrationPage;