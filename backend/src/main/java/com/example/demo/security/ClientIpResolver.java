package com.example.demo.security;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

/**
 * Resolves the "real" client IP for an incoming request.
 *
 * X-Forwarded-For is attacker-controlled unless the request actually came through a
 * proxy we trust, so it is only honoured when the socket's own address (getRemoteAddr())
 * is in the configured trusted-proxy list. With an empty list (the default), every
 * request is attributed to its socket address, which cannot be spoofed by the client.
 */
public final class ClientIpResolver {

    private ClientIpResolver() {
    }

    public static String resolve(HttpServletRequest request, List<String> trustedProxies) {
        String remoteAddr = request.getRemoteAddr();
        if (trustedProxies != null && trustedProxies.contains(remoteAddr)) {
            String xf = request.getHeader("X-Forwarded-For");
            if (xf != null && !xf.isBlank()) {
                return xf.split(",")[0].trim();
            }
        }
        return remoteAddr;
    }
}
