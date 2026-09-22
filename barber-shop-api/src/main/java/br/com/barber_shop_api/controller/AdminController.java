package br.com.barber_shop_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.barber_shop_api.entities.UserEntity;
import br.com.barber_shop_api.repository.IUserRepository;

@RestController
@RequestMapping("/admin")
public class AdminController {

	private final IUserRepository userRepository;

	public AdminController(IUserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@PutMapping("/users/{id}/promote")
	public ResponseEntity<?> promoteToAdmin(@PathVariable Long id) {
		UserEntity user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

		user.setRole("ADMIN");
		userRepository.save(user);

		return ResponseEntity.ok(new SuccessResponse(user.getName() + " agora é ADMIN"));
	}

	public record SuccessResponse(String message) {
	}

}
