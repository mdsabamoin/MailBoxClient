import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Navbar,
  Form,
  Modal,
} from "react-bootstrap";
import { setMails, markAsRead } from "../redux/mailSlice";
import { convertFromRaw } from "draft-js";
import Dashboard from "./Dashboard";

const Inbox = () => {
  const dispatch = useDispatch();
  const { mails, unreadCount } = useSelector((state) => state.mail); // Mail state
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State for Modal visibility
  const [selectedMail, setSelectedMail] = useState(null); // State for selected mail details
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [view, setView] = useState("inbox"); // Tracks current view: "inbox" or "sent"
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  useEffect(() => {
    const fetchMails = async () => {
      try {
        setLoading(true);
        const userEmail = email?.replace(".", ",");
        const apiPath =
          view === "inbox"
            ? `https://mailboxclient-5823c-default-rtdb.firebaseio.com/inbox/${userEmail}.json`
            : `https://mailboxclient-5823c-default-rtdb.firebaseio.com/sentbox/${userEmail}.json`;

        const response = await axios.get(apiPath);

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
  }, [dispatch, email, view]);

  const handleMailClick = (mailId) => {
    const mail = mails.find((m) => m.id === mailId);

    if (view === "inbox" && !mail.read) {
      axios
        .patch(
          `https://mailboxclient-5823c-default-rtdb.firebaseio.com/inbox/${email.replace(".", ",")}/${mailId}.json`,
          { read: true }
        )
        .then(() => dispatch(markAsRead(mailId)))
        .catch((error) => alert("Error updating read status: " + error.message));
    }

    setSelectedMail(mail);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMail(null);
  };

  const handleCompose = () => setShowComposeModal(true);

  const handleCloseComposeModal = () => setShowComposeModal(false);

  return (
    <>
      <Navbar bg="secondary" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold text-white" style={{ fontSize: "1.5rem" }}>
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

      <Container className="mt-3">
        <Row>
          <Col md={3} className="bg-light p-4 border rounded">
            <h5 className="fw-bold text-secondary">Messages</h5>
            <p className="text-muted fs-5">Total: {mails.length}</p>
            {view === "inbox" && <p className="text-muted fs-5">Unread: {unreadCount}</p>}
            <Button
              variant={view === "inbox" ? "secondary" : "light"}
              className="w-100 mb-2"
              onClick={() => setView("inbox")}
            >
              Inbox
            </Button>
            <Button
              variant={view === "sent" ? "secondary" : "light"}
              className="w-100"
              onClick={() => setView("sent")}
            >
              Sent
            </Button>
          </Col>

          <Col md={9}>
            <h2 className="text-center mb-4 text-primary">{view === "inbox" ? "Inbox" : "Sent"}</h2>

            {loading ? (
              <div className="text-center mt-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : mails.length > 0 ? (
              <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-secondary">
                  <tr>
                    <th>{view === "inbox" ? "From" : "To"}</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mails.map((mail) => (
                    <tr
                      key={mail.id}
                      style={{
                        fontWeight: mail.read ? "normal" : "bold",
                        cursor: "pointer",
                        backgroundColor: mail.read ? "white" : "#e6f7ff",
                      }}
                      onClick={() => handleMailClick(mail.id)}
                    >
                      <td>
                        {!mail.read && view === "inbox" && (
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
                        {view === "inbox" ? mail.sender : mail.recipient}
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

      {selectedMail && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {view === "inbox"
                ? `Message from ${selectedMail.sender}`
                : `Message to ${selectedMail.recipient}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Subject: {selectedMail.subject}</h5>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedMail.timestamp || Date.now()).toLocaleString()}
            </p>
            <hr />
            <p>
              <strong>Message:</strong>
            </p>
            <div dangerouslySetInnerHTML={{ __html: selectedMail.message }}></div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal show={showComposeModal} onHide={handleCloseComposeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Compose Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Dashboard />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Inbox;
