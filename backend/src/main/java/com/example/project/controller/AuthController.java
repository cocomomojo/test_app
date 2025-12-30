package com.example.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/public")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "user");
        String password = body.getOrDefault("password", "");

        // ローカルでは単純に固定テストユーザを受け入れる（実運用では使わない）
        if ("testuser".equals(username) && "Test1234!".equals(password)) {
            String token = "LOCAL-" + username + "-" + UUID.randomUUID();
            Map<String, String> res = new HashMap<>();
            res.put("idToken", token);
            return ResponseEntity.ok(res);
        }

        return ResponseEntity.status(401).body("invalid credentials");
    }
}
