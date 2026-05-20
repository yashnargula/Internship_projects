import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';

function Menu() {
  return (
    <ListGroup>
      <ListGroupItem tag={Link} to="/" action>
        Home
      </ListGroupItem>
      <ListGroupItem tag={Link} to="/add-course" action>
        Add Course
      </ListGroupItem>
      <ListGroupItem tag={Link} to="/view-course" action>
        View Course
      </ListGroupItem>
    </ListGroup>
  );
}

export default Menu;