package com.example.project.todo;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TodoServiceTest {

    @Mock
    private TodoRepository todoRepository;

    @InjectMocks
    private TodoService todoService;

    @Test
    void findAllReturnsRepositoryResults() {
        List<Todo> todos = List.of(new Todo(), new Todo());
        when(todoRepository.findAll()).thenReturn(todos);

        List<Todo> result = todoService.findAll();

        assertThat(result).isSameAs(todos);
        verify(todoRepository).findAll();
    }

    @Test
    void createSavesTodo() {
        Todo todo = new Todo();
        todo.setTitle("Sample");
        when(todoRepository.save(todo)).thenReturn(todo);

        Todo result = todoService.create(todo);

        assertThat(result).isSameAs(todo);
        verify(todoRepository).save(todo);
    }

    @Test
    void updateChangesTitleAndDone() {
        Todo existing = new Todo();
        existing.setTitle("Old");
        existing.setDone(false);

        Todo update = new Todo();
        update.setTitle("New");
        update.setDone(true);

        when(todoRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(todoRepository.save(any(Todo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Todo result = todoService.update(1L, update);

        assertThat(result.getTitle()).isEqualTo("New");
        assertThat(result.isDone()).isTrue();

        ArgumentCaptor<Todo> captor = ArgumentCaptor.forClass(Todo.class);
        verify(todoRepository).save(captor.capture());
        assertThat(captor.getValue().getTitle()).isEqualTo("New");
        assertThat(captor.getValue().isDone()).isTrue();
    }

    @Test
    void updateThrowsWhenNotFound() {
        when(todoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> todoService.update(999L, new Todo()))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Not found");
    }

    @Test
    void deleteRemovesById() {
        todoService.delete(10L);

        verify(todoRepository).deleteById(10L);
    }
}
