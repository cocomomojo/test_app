package com.example.project.todo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query("SELECT t FROM Todo t WHERE " +
            "(:priority IS NULL OR t.priority = :priority) AND " +
            "(:done IS NULL OR t.done = :done) AND " +
            "(:dueDateBefore IS NULL OR t.dueDate IS NULL OR t.dueDate <= :dueDateBefore) AND " +
            "(:dueDateAfter IS NULL OR t.dueDate IS NULL OR t.dueDate >= :dueDateAfter)")
    List<Todo> search(@Param("priority") Todo.Priority priority,
                      @Param("done") Boolean done,
                      @Param("dueDateBefore") LocalDate dueDateBefore,
                      @Param("dueDateAfter") LocalDate dueDateAfter);
}