package com.example.demo.security;

/**
 * Simple holder to access the active RateLimitFilter instance from admin controllers.
 * This avoids a larger refactor while still exposing inspection and control APIs.
 */
public final class RateLimitRegistry {
    private static volatile RateLimitFilter instance;

    private RateLimitRegistry() {}

    public static void register(RateLimitFilter f) {
        instance = f;
    }

    public static RateLimitFilter get() {
        return instance;
    }
}
