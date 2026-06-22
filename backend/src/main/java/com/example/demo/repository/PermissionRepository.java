package com.example.demo.repository;

import com.example.demo.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Permission> {
    Optional<Permission> findByName(String name);
    List<Permission> findByActiveTrue();
}
