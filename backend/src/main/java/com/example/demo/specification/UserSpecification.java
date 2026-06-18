package com.example.demo.specification;

import com.example.demo.entity.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {
    public static Specification<User> hasSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String like = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("username")), like),
                cb.like(cb.lower(root.get("email")), like),
                cb.like(cb.lower(root.get("firstName")), like),
                cb.like(cb.lower(root.get("lastName")), like)
        );
    }

    public static Specification<User> hasActive(Boolean active) {
        if (active == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("active"), active);
    }

    public static Specification<User> hasRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return null;
        }
        String normalized = roleName.toLowerCase();
        return (root, query, cb) -> cb.equal(cb.lower(root.join("role").get("name")), normalized);
    }
}
