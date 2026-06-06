package com.example.demo.specification;

import com.example.demo.entity.Permission;
import org.springframework.data.jpa.domain.Specification;

public class PermissionSpecification {
    public static Specification<Permission> hasSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String like = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("description")), like),
                cb.like(cb.lower(root.get("category")), like)
        );
    }

    public static Specification<Permission> hasActive(Boolean active) {
        if (active == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("active"), active);
    }
}
