package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;

/**
 * Simple IP allow-list filter. If the configured allow-list is empty, the filter is disabled.
 * Supports single IPs and IPv4 CIDR notation (e.g. 10.0.0.0/8).
 */
public class IpRestrictionFilter extends OncePerRequestFilter {

    private final List<String> allowList;
    private final List<String> trustedProxies;

    public IpRestrictionFilter(String allowListCsv, List<String> trustedProxies) {
        this.trustedProxies = trustedProxies == null ? List.of() : trustedProxies;
        if (allowListCsv == null || allowListCsv.trim().isEmpty()) {
            this.allowList = List.of();
        } else {
            String[] parts = allowListCsv.split(",");
            List<String> tmp = new ArrayList<>();
            for (String p : parts) {
                String t = p.trim();
                if (!t.isEmpty()) tmp.add(t);
            }
            this.allowList = List.copyOf(tmp);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Only apply to API endpoints and only when allow-list is configured
        String path = request.getRequestURI();
        return !path.startsWith("/api/") || allowList.isEmpty();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String clientIp = resolveClientIp(request);

        if (!isAllowed(clientIp)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"IP address not allowed\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowed(String ip) {
        if (allowList.isEmpty()) return true; // disabled
        for (String a : allowList) {
            if (a.contains("/")) {
                try {
                    if (cidrMatch(ip, a)) return true;
                } catch (Exception ignored) {
                }
            } else {
                if (a.equals(ip)) return true;
            }
        }
        return false;
    }

    private String resolveClientIp(HttpServletRequest request) {
        return ClientIpResolver.resolve(request, trustedProxies);
    }

    // IPv4 CIDR matching
    private static boolean cidrMatch(String ip, String cidr) throws Exception {
        if (ip == null || cidr == null) return false;
        if (!cidr.contains("/")) return false;

        String[] parts = cidr.split("/");
        String cidrBase = parts[0];
        int prefix = Integer.parseInt(parts[1]);

        InetAddress inetBase = InetAddress.getByName(cidrBase);
        InetAddress inetIp = InetAddress.getByName(ip);

        byte[] baseBytes = inetBase.getAddress();
        byte[] ipBytes = inetIp.getAddress();

        // only support IPv4 here for simplicity
        if (baseBytes.length != 4 || ipBytes.length != 4) {
            // fallback to simple string startsWith for IPv6-ish or unknown formats
            return ip.startsWith(cidrBase);
        }

        long baseLong = bytesToLong(baseBytes);
        long ipLong = bytesToLong(ipBytes);

        long mask = prefix == 0 ? 0L : (~0L) << (32 - prefix) & 0xFFFFFFFFL;

        return (baseLong & mask) == (ipLong & mask);
    }

    private static long bytesToLong(byte[] bytes) {
        return ((bytes[0] & 0xFFL) << 24) | ((bytes[1] & 0xFFL) << 16) | ((bytes[2] & 0xFFL) << 8) | (bytes[3] & 0xFFL);
    }
}
