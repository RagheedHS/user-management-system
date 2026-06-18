package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;

/**
 * Very small in-memory rate limiter + connection limiter for demonstration.
 * - per-IP request counters with a fixed 1-minute window
 * - special (lower) limit for login endpoints
 * - a global concurrent connection limit
 *
 * Note: This is intentionally simple and not distributed. For production use a redis-backed
 * rate limiter (Bucket4j, Redis buckets) is recommended.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final boolean enabled;
    private final int requestsPerMinute;
    private final int loginRequestsPerMinute;
    private final int maxConcurrent;
    private final java.util.List<String> trustedProxies;

    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> windowStarts = new ConcurrentHashMap<>();
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final ConcurrentHashMap<String, AtomicInteger> rejectedCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastRejectedAt = new ConcurrentHashMap<>();
    private final java.util.Set<String> blockedIPs = java.util.concurrent.ConcurrentHashMap.newKeySet();
    private final Counter rejectedRequestsCounter;
    private final Counter rejectedConnectionsCounter;

    public RateLimitFilter(boolean enabled, int requestsPerMinute, int loginRequestsPerMinute, int maxConcurrent,
                            java.util.List<String> trustedProxies, MeterRegistry registry) {
        this.enabled = enabled;
        this.requestsPerMinute = Math.max(1, requestsPerMinute);
        this.loginRequestsPerMinute = Math.max(1, loginRequestsPerMinute);
        this.maxConcurrent = Math.max(1, maxConcurrent);
        this.trustedProxies = trustedProxies == null ? java.util.List.of() : trustedProxies;
        this.rejectedRequestsCounter = registry.counter("security.rate_limit.rejected.requests");
        this.rejectedConnectionsCounter = registry.counter("security.rate_limit.rejected.connections");
        // register self for admin access
        RateLimitRegistry.register(this);
    }

    public RateLimitFilter(boolean enabled, int requestsPerMinute, int loginRequestsPerMinute, int maxConcurrent, java.util.List<String> trustedProxies) {
        this(enabled, requestsPerMinute, loginRequestsPerMinute, maxConcurrent, trustedProxies, io.micrometer.core.instrument.Metrics.globalRegistry);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // only apply to API endpoints when enabled
        return !request.getRequestURI().startsWith("/api/") || !enabled;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = resolveClientIp(request);

        // Let CORS preflight (OPTIONS) pass through so the CorsFilter can apply headers.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();

        // immediate blocklist check
        if (blockedIPs.contains(clientIp)) {
            // ensure CORS headers exist on error responses so browser can observe status
            String origin = request.getHeader("Origin");
            response.setHeader("Access-Control-Allow-Origin", origin != null ? origin : "*");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            log.warn("Blocking request from blocked IP {} to {}", clientIp, uri);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"IP blocked by admin\"}");
            return;
        }

        int current = activeConnections.incrementAndGet();
            if (current > maxConcurrent) {
            activeConnections.decrementAndGet();
            rejectedConnectionsCounter.increment();
            String origin = request.getHeader("Origin");
            response.setHeader("Access-Control-Allow-Origin", origin != null ? origin : "*");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            log.warn("Rejecting connection from {} to {} due to maxConcurrent {} (active={})", clientIp, uri, maxConcurrent, current);
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many concurrent connections\"}");
            response.setHeader("Retry-After", "1");
            return;
        }

        try {
            String path = request.getRequestURI();
            boolean isLogin = path.equalsIgnoreCase("/api/auth/login") || path.startsWith("/api/auth/login");
            int limit = isLogin ? loginRequestsPerMinute : requestsPerMinute;

            long now = System.currentTimeMillis();
            long windowMs = 60_000L;

            long windowStart = windowStarts.computeIfAbsent(clientIp, k -> now);
            if (now - windowStart > windowMs) {
                windowStarts.put(clientIp, now);
                counters.put(clientIp, new AtomicInteger(1));
            } else {
                AtomicInteger counter = counters.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
                int currentCount = counter.incrementAndGet();
                if (currentCount > limit) {
                        rejectedRequestsCounter.increment();
                        rejectedCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0)).incrementAndGet();
                        lastRejectedAt.put(clientIp, System.currentTimeMillis());
                    String origin = request.getHeader("Origin");
                    response.setHeader("Access-Control-Allow-Origin", origin != null ? origin : "*");
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                    log.warn("Rejecting request from {} to {}: {} > limit {}", clientIp, uri, currentCount, limit);
                    response.setStatus(429);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Too many requests\"}");
                    response.setHeader("Retry-After", "60");
                    response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
                    response.setHeader("X-RateLimit-Remaining", "0");
                    return;
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            activeConnections.decrementAndGet();
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        return ClientIpResolver.resolve(request, trustedProxies);
    }

    // Admin helpers
    public java.util.Map<String, Integer> getCountersSnapshot() {
        java.util.Map<String, Integer> snap = new java.util.HashMap<>();
        counters.forEach((k, v) -> snap.put(k, v.get()));
        return snap;
    }

    public java.util.Map<String, Long> getWindowStartsSnapshot() {
        return new java.util.HashMap<>(windowStarts);
    }

    public java.util.Map<String, Integer> getRejectedSnapshot() {
        java.util.Map<String, Integer> snap = new java.util.HashMap<>();
        rejectedCounts.forEach((k, v) -> snap.put(k, v.get()));
        return snap;
    }

    public int getActiveConnections() {
        return activeConnections.get();
    }

    public java.util.Set<String> getBlockedIPs() {
        return java.util.Set.copyOf(blockedIPs);
    }

    public void clearCounters() {
        counters.clear();
        windowStarts.clear();
        rejectedCounts.clear();
        lastRejectedAt.clear();
        activeConnections.set(0);
    }

    public void addBlockedIP(String ip) {
        blockedIPs.add(ip);
    }

    public void removeBlockedIP(String ip) {
        blockedIPs.remove(ip);
    }
}
