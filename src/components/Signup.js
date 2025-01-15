import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { signupUser, loginUser } from "../redux/authSlice";
import Card from 'react-bootstrap/Card';
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user ,enter} = useSelector((state) => state.auth);

//   localStorage.setItem("idToken",user.idToken);
  
  useEffect(() => {
    if (enter) {
      // If user exists in the state, navigate to the dashboard
      navigate("/dashboard");
    }
  }, [enter, navigate]);

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    dispatch(signupUser({ email, password }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
    
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh" }}>
    <Card style={{maxWidth: '400px', height: "auto", backgroundColor: "orange" }}>
      <Card.Body>
        <h2 className="text-center">{isLogin ? "Login" : "Signup"}</h2>
        <Form onSubmit={isLogin ? handleLogin : handleSignup}>
          {error && <Alert variant="danger">{error}</Alert>}
          {user && <Alert variant="success">Welcome, {user.email}!</Alert>}
  
          <Form.Group className="mb-4" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
  
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
  
          {!isLogin && (
            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
          )}
  
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%" }} // Ensure the button doesn't overflow
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Signup"}
          </Button>
  
          <div className="mt-3" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {isLogin ? (
              <p>
                Don’t have an account?{" "}
                <Button variant="link" onClick={() => setIsLogin(false)}>
                  Signup
                </Button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Button variant="link" onClick={() => setIsLogin(true)}>
                  Login
                </Button>
              </p>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  </div>
  

  );
};

export default Signup;
