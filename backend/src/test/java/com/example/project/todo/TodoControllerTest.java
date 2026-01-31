package com.example.project.todo;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TodoController.class)
@AutoConfigureMockMvc(addFilters = false)
class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TodoService todoService;

    @Test
    void listReturnsTodos() throws Exception {
        Todo todo = new Todo();
        todo.setId(1L);
        todo.setTitle("Sample");
        todo.setDone(false);

        when(todoService.findAll()).thenReturn(List.of(todo));

        mockMvc.perform(get("/todo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Sample"))
                .andExpect(jsonPath("$[0].done").value(false));
    }

    @Test
    void createReturnsSavedTodo() throws Exception {
        Todo request = new Todo();
        request.setTitle("New");
        request.setDone(false);

        Todo saved = new Todo();
        saved.setId(10L);
        saved.setTitle("New");
        saved.setDone(false);

        when(todoService.create(any(Todo.class))).thenReturn(saved);

        mockMvc.perform(post("/todo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.title").value("New"));
    }

    @Test
    void updateReturnsUpdatedTodo() throws Exception {
        Todo request = new Todo();
        request.setTitle("Updated");
        request.setDone(true);

        Todo updated = new Todo();
        updated.setId(1L);
        updated.setTitle("Updated");
        updated.setDone(true);

        when(todoService.update(eq(1L), any(Todo.class))).thenReturn(updated);

        mockMvc.perform(put("/todo/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated"))
                .andExpect(jsonPath("$.done").value(true));
    }

    @Test
    void deleteReturnsOk() throws Exception {
        mockMvc.perform(delete("/todo/5"))
                .andExpect(status().isOk());

        verify(todoService).delete(5L);
    }
}
