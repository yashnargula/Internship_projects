package com.restApi.restApi.Dao;

import com.restApi.restApi.entities.courseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseDAO extends JpaRepository<courseEntity,Long> {
}
