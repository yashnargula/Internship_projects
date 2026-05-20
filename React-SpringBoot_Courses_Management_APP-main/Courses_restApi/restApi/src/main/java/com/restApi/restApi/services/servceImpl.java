package com.restApi.restApi.services;

import com.restApi.restApi.Dao.CourseDAO;
import com.restApi.restApi.entities.courseEntity;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class servceImpl implements course{

    @Autowired
    private CourseDAO coursedao;


   List<courseEntity> list;

   public servceImpl()
   {
//       list = new ArrayList<>();
//       list.add(new courseEntity(101,"Java Cognitive"));
//       list.add(new courseEntity(102,"Python Cognitive"));
   }




    @Override
    public List<courseEntity> getcourses() {
        List<courseEntity> all = coursedao.findAll();
        if (all.isEmpty()) {
            return Collections.emptyList();
        }
        return all;
    }



    @Override
    public courseEntity getcousebyid(long courseid) {

//       return list.stream().filter(i -> i.getId()==courseid).findFirst().orElseThrow();
        return  coursedao.getReferenceById(courseid);
    }

    @Override
    public courseEntity addcourse(courseEntity courseEntity) {
//        list.add(courseEntity);
        return coursedao.save(courseEntity);
    }

    @Override
    public courseEntity deletebyid(long courseid) {


        courseEntity entity = coursedao.findById(courseid)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with ID: " + courseid));

        coursedao.delete(entity);
        return entity;

    }


}
//       Optional<courseEntity> delete = Optional.ofNullable(list.stream().filter(i -> i.getId() == courseid).findFirst().orElse(null));
//
//       delete.ifPresent(list::remove);