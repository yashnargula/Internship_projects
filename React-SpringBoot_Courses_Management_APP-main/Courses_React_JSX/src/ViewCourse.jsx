import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardTitle
} from 'reactstrap';
import base_url from './api/Server';
import axios from 'axios';
import { toast } from 'react-toastify';

function ViewCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all courses from backend
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base_url}/courses`);
      console.log("📦 Courses received:", res.data);
      setCourses(res.data);
      toast.success("Courses loaded");
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Delete a course by ID
  const deleteCourseById = async (id) => {
    try {
      await axios.delete(`${base_url}/courses/${id}`);
      toast.success("Course deleted successfully!");
      fetchCourses(); // Refresh list after deletion
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="mb-3">
              <CardBody>
                <CardTitle tag="h5">{course.title}</CardTitle>
                <CardSubtitle className="mb-2 text-muted">
                  {course.description || "No description provided"}
                </CardSubtitle>
                <div className="d-flex gap-2 mt-3">
                  <Button color="warning">ADD</Button>
                  <Button color="danger" onClick={() => deleteCourseById(course.id)}>
                    DELETE
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <p>No courses available.</p>
        )
      )}
    </div>
  );
}

export default ViewCourse;