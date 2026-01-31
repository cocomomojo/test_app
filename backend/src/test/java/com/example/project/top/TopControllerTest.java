package com.example.project.top;

import com.example.project.todo.Todo;
import com.example.project.todo.TodoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TopController.class)
@AutoConfigureMockMvc(addFilters = false)
class TopControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TodoRepository todoRepository;

    @Test
    void topReturnsGuestAndTodoCount() throws Exception {
        Todo done = new Todo();
        done.setDone(true);

        Todo open = new Todo();
        open.setDone(false);

        when(todoRepository.findAll()).thenReturn(List.of(done, open));

        mockMvc.perform(get("/top"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("guest"))
                .andExpect(jsonPath("$.todoCount").value(1))
                .andExpect(jsonPath("$.accessCount").value(1))
                .andExpect(jsonPath("$.now").isNotEmpty());
    }
}
