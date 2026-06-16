package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Lightweight sanctum-like entrypoints for health and quick environment checks.
 */
@RestController
@RequestMapping("/api/sanctum")
public class SanctumController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health(@RequestHeader(value = "X-Forwarded-For", required = false) String xff) {
        Map<String, Object> r = new HashMap<>();
        r.put("status", "ok");
        r.put("xff", xff == null ? "" : xff);
        return ResponseEntity.ok(r);
    }
}
