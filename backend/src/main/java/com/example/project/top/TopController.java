package com.example.project.top;

import com.example.project.todo.TodoRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/top")
public class TopController {

    private final TodoRepository todoRepository;
    private final AtomicInteger accessCount = new AtomicInteger(0);

    public TopController(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    @GetMapping
    public TopResponse getTop(@AuthenticationPrincipal Object principal, Authentication authentication) {

        String username = "guest";

        if (principal instanceof Jwt jwt) {
            username = jwt.getClaimAsString("username");
        } else if (authentication != null && authentication.getName() != null) {
            username = authentication.getName();
        }


        int todoCount = (int) todoRepository.findAll()
                .stream()
                .filter(t -> !t.isDone())
                .count();

        return new TopResponse(
                username,
                LocalDateTime.now().toString(),
                accessCount.incrementAndGet(),
                todoCount
        );
    }
}