package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class PrometheusAuthFilter extends OncePerRequestFilter {

    private final List<String> allowList;
    private final boolean basicAuthEnabled;
    private final String basicUser;
    private final String basicPass;

    public PrometheusAuthFilter(String allowListCsv, boolean basicAuthEnabled, String basicUser, String basicPass) {
        if (allowListCsv == null || allowListCsv.isBlank()) this.allowList = List.of();
        else {
            String[] parts = allowListCsv.split(",");
            List<String> tmp = new ArrayList<>();
            for (String p : parts) { if (!p.isBlank()) tmp.add(p.trim()); }
            this.allowList = List.copyOf(tmp);
        }
        this.basicAuthEnabled = basicAuthEnabled;
        this.basicUser = basicUser == null ? "" : basicUser;
        this.basicPass = basicPass == null ? "" : basicPass;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"/actuator/prometheus".equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String clientIp = resolveClientIp(request);

        if (!allowList.isEmpty()) {
            boolean ok = allowList.contains(clientIp);
            if (ok) { filterChain.doFilter(request, response); return; }
        }

        if (basicAuthEnabled) {
            String auth = request.getHeader("Authorization");
            if (auth != null && auth.startsWith("Basic ")) {
                try {
                    String token = auth.substring(6).trim();
                    String decoded = new String(Base64.getDecoder().decode(token));
                    String[] parts = decoded.split(":",2);
                    if (parts.length == 2 && parts[0].equals(basicUser) && parts[1].equals(basicPass)) {
                        filterChain.doFilter(request, response);
                        return;
                    }
                } catch (IllegalArgumentException ignored) {}
            }
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader("WWW-Authenticate", "Basic realm=\"metrics\"");
            return;
        }

        // default deny
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"metrics access restricted\"}");
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
