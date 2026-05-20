import axios from 'axios';
import base_url from './api/Server';
import React, { useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Container
} from 'reactstrap';
import { toast } from 'react-toastify';

function AddCourse() {
  const [formdata, setformdata] = useState({});

  const postOnServer = async (course) => {
    try {
      console.log("📤 Sending to backend:", course);
      const res = await axios.post(`${base_url}/courses`, course);
      console.log("✅ Response from backend:", res.data);
      toast.success("Course added successfully!");
    } catch (error) {
      console.error("❌ Error posting course:", error);
      toast.error("Error adding course");
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    postOnServer(formdata);
  };

  return (
    <Container>
      <h2 className="my-3">Add Course</h2>
      <Form onSubmit={submitHandler}>
        <FormGroup>
          <Label for="title">Course Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter course title"
            type="text"
            onChange={(e) =>
              setformdata({ ...formdata, [e.target.name]: e.target.value })
            }
          />
        </FormGroup>

        <FormGroup>
          <Label for="description">Course Description</Label>
          <Input
            id="description"
            name="description"
            type="textarea"
            placeholder="Enter course description"
            onChange={(e) =>
              setformdata({ ...formdata, [e.target.name]: e.target.value })
            }
          />
        </FormGroup>

        <Button color="primary">Submit</Button>
      </Form>
    </Container>
  );
}

export default AddCourse;