import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Row, Col, Spinner, Navbar, Form } from "react-bootstrap";
import { convertFromRaw } from "draft-js";

const Inbox = () => {
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enter, user } = useSelector((state) => state.auth); // Logged-in user
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  if (!enter) {
    navigate("/");
  }

  useEffect(() => {
    const fetchMails = async () => {
      try {
        setLoading(true);
        const userEmail = user.email.replace(".", ",");
        const response = await axios.get(
          `https://mailboxclient-5823c-default-rtdb.firebaseio.com/inbox/${userEmail}.json`
        );

        const mailData = response.data
          ? Object.keys(response.data).map((key) => {
              const mail = response.data[key];
              let message = "";

              try {
                // Convert the message content to plain text
                const contentState = convertFromRaw(JSON.parse(mail.message));
                message = contentState.getPlainText();
              } catch {
                // If parsing fails, use the raw message as fallback
                message = mail.message;
              }

              return {
                id: key,
                ...mail,
                message,
              };
            })
          : [];
        setMails(mailData);
      } catch (error) {
        alert("Error fetching emails: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMails();
  }, [user.email]);

  const handleCompose = () => {
    navigate("/dashboard"); // Navigate to the Dashboard component
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="secondary"style={{minWidth:"30%"}} className="mb-4">
        <Container>
          <Navbar.Brand className="fw-bold" style={{ fontSize: "1.5rem" }}>
            Mailbox
          </Navbar.Brand>
          <Form className="d-flex mx-auto" style={{ width: "50%" }}>
            <Form.Control
              type="search"
              placeholder="Find messages, photos, documents, or people"
              className="me-2"
              aria-label="Search"
            />
          </Form>
          <Button variant="primary" onClick={handleCompose}>
            Compose
          </Button>
        </Container>
      </Navbar>

      {/* Inbox */}
      <Container className="mt-3">
        <Row>
          <Col>
            <h2 className="text-center mb-4">Inbox</h2>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" />
          </div>
        ) : mails.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {mails.map((mail) => (
                <tr key={mail.id}>
                  <td>{mail.sender}</td>
                  <td>{mail.subject}</td>
                  <td>{mail.message.slice(0, 50)}...</td>
                  <td>{new Date(mail.timestamp || Date.now()).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center">No mails found.</p>
        )}
      </Container>
    </>
  );
};

export default Inbox;
