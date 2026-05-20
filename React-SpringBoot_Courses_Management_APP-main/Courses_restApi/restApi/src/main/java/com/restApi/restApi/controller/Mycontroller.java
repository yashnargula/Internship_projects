package com.restApi.restApi.controller;

import com.restApi.restApi.entities.courseEntity;
import com.restApi.restApi.services.course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173") 
public class Mycontroller {

    @Autowired
    course course;

    @GetMapping("/courses")
    public List<courseEntity> allcourses(){

        return course.getcourses();
    }   


    @GetMapping("/courses/{courseid}")
    public courseEntity getcourse(@PathVariable String courseid){

        return course.getcousebyid(Long.parseLong(courseid));
    }

    @PostMapping("/courses")
     public courseEntity addcourse(@RequestBody courseEntity courseEntity){

        return course.addcourse(courseEntity);
     }

     @DeleteMapping("/courses/{courseid}")
    public courseEntity deletecourse(@PathVariable String courseid){
        return course.deletebyid(Long.parseLong(courseid));
     }


}
