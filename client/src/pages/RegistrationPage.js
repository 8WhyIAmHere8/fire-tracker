import { useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

function RegistrationPage() {
  const [staffNumber, setStaffNumber] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const response = await registerUser(username, staffNumber, fullName, password);
    if (response.success) {
      alert("Registration successful!");
      navigate('/');
    } else {
      alert("Registration failed!");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-4 shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Register Fire Warden</h2>
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
                <Form.Group className="mb-3" controlId="formStaffNumber">
                  <Form.Label>Staff Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter staff number"
                    value={staffNumber}
                    onChange={(e) => setStaffNumber(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formFullName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                <div className="d-flex justify-content-end">
                  <Button className="Button" onClick={handleRegister}>
                    Register
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

export default RegistrationPage;