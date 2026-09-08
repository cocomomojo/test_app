package com.example.project.todo;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TodoService {

    private final TodoRepository repo;

    public TodoService(TodoRepository repo) {
        this.repo = repo;
    }

    public List<Todo> findAll() {
        return repo.findAll();
    }

    public Todo create(Todo todo) {
        return repo.save(todo);
    }

    public Todo update(Long id, Todo todo) {
        Todo existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        existing.setTitle(todo.getTitle());
        existing.setDone(todo.isDone());
        if (todo.getPriority() != null) {
            existing.setPriority(todo.getPriority());
        }
        if (todo.getDueDate() != null) {
            existing.setDueDate(todo.getDueDate());
        }

        return repo.save(existing);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<Todo> search(Todo.Priority priority, Boolean done, LocalDate dueDateBefore, LocalDate dueDateAfter) {
        return repo.search(priority, done, dueDateBefore, dueDateAfter);
    }
}