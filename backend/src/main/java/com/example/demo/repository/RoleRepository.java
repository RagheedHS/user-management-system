package com.example.demo.repository;

import com.example.demo.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Role> {
    Optional<Role> findByName(String name);
    List<Role> findByActiveTrue();
    List<Role> findByRoleLevelGreaterThanEqual(Integer roleLevel);
}
