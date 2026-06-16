package com.example.demo.controller;

import com.example.demo.security.RateLimitFilter;
import com.example.demo.security.RateLimitRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/security")
@RequiredArgsConstructor
public class SecurityAdminController {

    @GetMapping("/counters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCounters() {
        RateLimitFilter f = RateLimitRegistry.get();
        if (f == null) return ResponseEntity.badRequest().body(Map.of("error", "rate limiter unavailable"));

        return ResponseEntity.ok(Map.of(
                "activeConnections", f.getActiveConnections(),
                "counters", f.getCountersSnapshot(),
                "windowStarts", f.getWindowStartsSnapshot(),
                "rejected", f.getRejectedSnapshot(),
                "blockedIPs", f.getBlockedIPs()
        ));
    }

    @PostMapping("/flush")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> flushCounters() {
        RateLimitFilter f = RateLimitRegistry.get();
        if (f == null) return ResponseEntity.badRequest().body(Map.of("error", "rate limiter unavailable"));
        f.clearCounters();
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/blocked")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBlocked() {
        RateLimitFilter f = RateLimitRegistry.get();
        if (f == null) return ResponseEntity.badRequest().body(Map.of("error", "rate limiter unavailable"));
        return ResponseEntity.ok(Map.of("blocked", f.getBlockedIPs()));
    }

    @PostMapping("/blocked")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addBlocked(@RequestParam String ip) {
        RateLimitFilter f = RateLimitRegistry.get();
        if (f == null) return ResponseEntity.badRequest().body(Map.of("error", "rate limiter unavailable"));
        f.addBlockedIP(ip);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @DeleteMapping("/blocked")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeBlocked(@RequestParam String ip) {
        RateLimitFilter f = RateLimitRegistry.get();
        if (f == null) return ResponseEntity.badRequest().body(Map.of("error", "rate limiter unavailable"));
        f.removeBlockedIP(ip);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
