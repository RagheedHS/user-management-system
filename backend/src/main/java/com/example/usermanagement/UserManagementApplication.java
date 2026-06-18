package com.example.usermanagement;

import com.example.usermanagement.model.User;
import com.example.usermanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class UserManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserManagementApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedDatabase(UserRepository userRepository) {
		return args -> {
			BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
			if (userRepository.count() == 0) {
				userRepository.save(new User(
					"Sarah Connor",
					"sarah@resistance.io",
					encoder.encode("admin123"),
					"Active",
					"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
				));
				userRepository.save(new User(
					"John Connor",
					"john@resistance.io",
					encoder.encode("editor123"),
					"Active",
					"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
				));
				userRepository.save(new User(
					"Marcus Wright",
					"marcus@skynet.com",
					encoder.encode("viewer123"),
					"Pending",
					"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
				));
				userRepository.save(new User(
					"Kyle Reese",
					"kyle@resistance.io",
					encoder.encode("viewer123"),
					"Inactive",
					"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150"
				));
				System.out.println("Seed data with BCrypt-encoded passwords loaded into H2 Database.");
			}
		};
	}
}
