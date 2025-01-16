import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Row, Col, Spinner, Navbar, Form, Modal } from "react-bootstrap";
import { setMails, markAsRead } from "../redux/mailSlice"; // Import actions from Redux slice
import { convertFromRaw } from "draft-js";

const Inbox = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enter, user } = useSelector((state) => state.auth); // Auth state
  const { mails, unreadCount } = useSelector((state) => state.mail); // Mail state
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State for Modal visibility
  const [selectedMail, setSelectedMail] = useState(null); // State for selected mail details
  const location = useLocation();

//   if (!enter) {
//     navigate("/");
//   }

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const fetchMails = async () => {
        
      try {
        setLoading(true);
        const userEmail = email?.replace(".", ",");
        console.log(userEmail,"useremailbbbb");
        const response = await axios.get(
          `https://mailboxclient-5823c-default-rtdb.firebaseio.com/inbox/${userEmail}.json`
        );

        const mailData = response.data
          ? Object.keys(response.data).map((key) => {
              const mail = response.data[key];
              let message = "";

              try {
                const contentState = convertFromRaw(JSON.parse(mail.message));
                message = contentState.getPlainText();
              } catch {
                message = mail.message;
              }

              return {
                id: key,
                ...mail,
                message,
              };
            })
          : [];
        dispatch(setMails(mailData));
      } catch (error) {
        alert("Error fetching emails: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMails();
  }, [user?.email, dispatch]);

  const handleMailClick = async (mailId) => {
    const mail = mails?.find((m) => m.id === mailId);
    if (!mail.read) {
      try {
        await axios.patch(
          `https://mailboxclient-5823c-default-rtdb.firebaseio.com/inbox/${user?.email?.replace(".", ",")}/${mailId}.json`,
          { read: true }
        );
        dispatch(markAsRead(mailId));
      } catch (error) {
        alert("Error updating read status: " + error.message);
      }
    }

    setSelectedMail(mail); // Set the selected mail details
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    setSelectedMail(null); // Reset the selected mail
  };

  const handleCompose = () => {
    navigate("/dashboard");
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="secondary" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold" style={{ fontSize: "1.5rem", color: "white" }}>
            Mailbox
          </Navbar.Brand>
          <Form className="d-flex mx-auto" style={{ width: "50%" }}>
            <Form.Control
              type="search"
              placeholder="Find messages, photos, documents, or people"
              className="me-2 shadow-sm"
              aria-label="Search"
            />
          </Form>
          <Button variant="primary" className="shadow-sm" onClick={handleCompose}>
            Compose
          </Button>
        </Container>
      </Navbar>

      {/* Main Inbox Section */}
      <Container className="mt-3">
        <Row>
          <Col md={3} className="bg-light p-4 border rounded">
            {/* Sidebar for Total and Unread Messages */}
            <h5 className="fw-bold text-secondary">Messages</h5>
            <p className="text-muted fs-5">Total: {mails.length}</p>
            <p className="text-muted fs-5">Unread: {unreadCount}</p>
          </Col>
          <Col md={9}>
            <h2 className="text-center mb-4 text-primary">Inbox</h2>

            {loading ? (
              <div className="text-center mt-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : mails.length > 0 ? (
              <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-secondary">
                  <tr>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mails.map((mail) => (
                    <tr
                      key={mail.id}
                      onClick={() => handleMailClick(mail.id)}
                      style={{
                        fontWeight: mail.read ? "normal" : "bold",
                        cursor: "pointer",
                        backgroundColor: mail.read ? "white" : "#e6f7ff",
                      }}
                    >
                      <td>
                        {!mail.read && (
                          <span
                            style={{
                              color: "blue",
                              marginRight: "5px",
                              fontSize: "1.2rem",
                            }}
                          >
                            ●
                          </span>
                        )}
                        {mail.sender}
                      </td>
                      <td>{mail.subject}</td>
                      <td>{mail.message.slice(0, 50)}...</td>
                      <td>{new Date(mail.timestamp || Date.now()).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-center text-muted">No mails found.</p>
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal for reading the full mail */}
      {selectedMail && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Message from {selectedMail.sender}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <h5>Subject: {selectedMail.subject}</h5>
              <p><strong>Date:</strong> {new Date(selectedMail.timestamp || Date.now()).toLocaleString()}</p>
              <hr />
              <p><strong>Message:</strong></p>
              <div dangerouslySetInnerHTML={{ __html: selectedMail.message }}></div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary">Reply</Button>
            <Button variant="info">Forward</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default Inbox;
