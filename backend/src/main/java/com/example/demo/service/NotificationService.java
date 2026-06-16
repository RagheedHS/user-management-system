package com.example.demo.service;

import com.example.demo.dto.NotificationDTO;
import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationDTO> getForUser(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return List.of();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public long unreadCount(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return 0L;
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markRead(Long id, String username) {
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n == null) return;
        if (!n.getUser().getUsername().equals(username)) return;
        if (!Boolean.TRUE.equals(n.getIsRead())) {
            n.setIsRead(true);
            notificationRepository.save(n);
        }
    }

    public NotificationDTO create(String text, boolean isStatic, String username) {
        if (username == null) return null;
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return null;
        Notification n = new Notification();
        n.setUser(user);
        n.setText(text != null ? text : "");
        n.setIsStatic(isStatic);
        Notification saved = notificationRepository.save(n);
        return toDTO(saved);
    }

    public NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setUserId(n.getUser() != null ? n.getUser().getId() : null);
        dto.setText(n.getText());
        dto.setIsRead(n.getIsRead());
        dto.setIsStatic(n.getIsStatic());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
