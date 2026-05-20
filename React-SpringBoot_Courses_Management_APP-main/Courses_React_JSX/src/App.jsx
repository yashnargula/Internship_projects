import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './Header';
import Menu from './Menu';
import Home from './Home';
import { Routes, Route } from 'react-router-dom';
import AddCourse from './AddCourse';
import ViewCourse from './ViewCourse';

function App() {
  return (
    <div>
      <Header />

      <Container>
        <Row>
          <Col md={4}>
            <Menu />
          </Col>
          <Col md={8}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add-course" element={<AddCourse />} />
              <Route path="/view-course" element={<ViewCourse />} />
            </Routes>
          </Col>
        </Row>
      </Container>

      
      <ToastContainer  position='bottom-center'/>
    </div>
  );
}

export default App;