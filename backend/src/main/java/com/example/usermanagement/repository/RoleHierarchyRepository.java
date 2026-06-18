package com.example.usermanagement.repository;

import com.example.usermanagement.model.Role;
import com.example.usermanagement.model.RoleHierarchyMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoleHierarchyRepository extends JpaRepository<RoleHierarchyMapping, Long> {
    boolean existsByParentAndChild(Role parent, Role child);
    List<RoleHierarchyMapping> findByParent(Role parent);
    List<RoleHierarchyMapping> findByChild(Role child);
}
