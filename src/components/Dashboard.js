import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import axios from "axios";

const Dashboard = () => {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [isSending, setIsSending] = useState(false);
  const { user } = useSelector((state) => state.auth); // Get the current user (sender)
  const navigate = useNavigate();

  if (!user) {
    navigate("/"); // If no user is logged in, navigate to login/signup page
  }

  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  const handleSendMail = async (e) => {
    e.preventDefault();

    if (!recipient || !subject || !editorState) {
      alert("Please fill in all fields!");
      return;
    }

    setIsSending(true);

    const emailContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    const emailData = {
      sender: user.email,
      recipient,
      subject,
      message: emailContent,
    };

    try {
      // Save email in the sender's sentbox
      await axios.post(
        `https://mailboxclient-5823c-default-rtdb.firebaseio.com/sentbox/${user.email.replace(
          ".",
          ","
        )}.json`,
        emailData
      );

      // Save email in the receiver's inbox
      await axios.post(
        `https://mailboxclient-5823c-default-rtdb.firebaseio.com/inbox/${recipient.replace(
          ".",
          ","
        )}.json`,
        emailData
      );

      alert("Email sent successfully!");
      setRecipient("");
      setSubject("");
      setEditorState(EditorState.createEmpty());
    } catch (error) {
      alert("Error sending email: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "800px" }}>
      <h2 className="text-center mb-4">Compose Email</h2>
      <Form>
        <Form.Group as={Row} className="mb-3" controlId="formRecipient">
          <Form.Label column sm={2}>
            To:
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="email"
              placeholder="Recipient Email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formSubject">
          <Form.Label column sm={2}>
            Subject:
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formMessage">
          <Form.Label column sm={2}>
            Message:
          </Form.Label>
          <Col sm={10}>
            <Editor
               editorStyle={{
                border: "1px solid #ced4da",
                borderRadius: "4px",
                padding: "10px",
                minHeight: "230px",
              }}
              editorState={editorState}
              onEditorStateChange={handleEditorChange}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              toolbarClassName="demo-toolbar"
             
            />
          </Col>
        </Form.Group>

        <div className="text-center">
          <Button
            variant="primary"
            onClick={handleSendMail}
            disabled={isSending || !recipient || !subject || !editorState}
            style={{ height: "40px", minWidth: "100px" }}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default Dashboard;
