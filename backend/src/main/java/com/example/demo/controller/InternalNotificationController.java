package com.example.demo.controller;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class InternalNotificationController {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody Notification payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User u = userRepository.findByUsername(principal.getName()).orElse(null);
        if (u == null) return ResponseEntity.status(404).build();
        Notification n = new Notification();
        n.setUser(u);
        n.setText(payload.getText());
        n.setIsRead(payload.getIsRead() != null ? payload.getIsRead() : false);
        n.setIsStatic(payload.getIsStatic() != null ? payload.getIsStatic() : false);
        notificationRepository.save(n);
        return ResponseEntity.ok().build();
    }
}
