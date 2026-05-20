package com.restApi.restApi.services;

import com.restApi.restApi.entities.courseEntity;

import java.util.List;

public interface course  {

    public List<courseEntity> getcourses();

    public courseEntity getcousebyid(long courseid);

    public courseEntity addcourse(courseEntity courseEntity);

    public courseEntity deletebyid(long courseid);
}
