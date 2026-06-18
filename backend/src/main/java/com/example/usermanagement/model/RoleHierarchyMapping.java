package com.example.usermanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "role_hierarchy", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"parent_role_id", "child_role_id"})
})
public class RoleHierarchyMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_role_id", nullable = false)
    private Role parent;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "child_role_id", nullable = false)
    private Role child;

    // Constructors
    public RoleHierarchyMapping() {}

    public RoleHierarchyMapping(Role parent, Role child) {
        this.parent = parent;
        this.child = child;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Role getParent() {
        return parent;
    }

    public void setParent(Role parent) {
        this.parent = parent;
    }

    public Role getChild() {
        return child;
    }

    public void setChild(Role child) {
        this.child = child;
    }
}
