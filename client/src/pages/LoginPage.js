import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchHealthCheck, loginUser } from '../api';
import dawg from '../logo.png';

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [setBackendMessage] = useState("Loading...");
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
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-4 shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <img src={dawg} alt="logo" style={{ width: 80, height: 80 }} />
                <h3 className="mt-2">Fire Warden Tracker</h3>
              </div>
              <Form>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button variant="secondary" className="Button" onClick={handleRegister}>
                    Register
                  </Button>
                  <Button variant="primary" className="Button" onClick={handleLogin}>
                    Login
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
