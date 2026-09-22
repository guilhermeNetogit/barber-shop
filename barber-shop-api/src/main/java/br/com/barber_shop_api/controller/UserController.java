package br.com.barber_shop_api.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.barber_shop_api.entities.UserEntity;
import br.com.barber_shop_api.repository.IUserRepository;

@RestController
@RequestMapping("/users")
public class UserController {

	private final IUserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	public UserController(IUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
	
	@GetMapping("/me")
	public ResponseEntity<?> getCurrentUser(Authentication authentication) {
		UserEntity user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
		return ResponseEntity.ok(new UserProfileResponse(user.getName(), user.getEmail(), user.getCpf(), user.getRole()));
	    
	}
	
	@PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication authentication, @RequestBody UpdateProfileRequest request) {
        UserEntity user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(new ErrorResponse("Senha atual incorreta"));
        }

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }

        if (request.email() != null && !request.email().isBlank() && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.findByEmail(request.email()).isPresent()) {
                return ResponseEntity.status(409).body(new ErrorResponse("E-mail já está em uso"));
            }
            user.setEmail(request.email());
        }

        if (request.cpf() != null && !request.cpf().isBlank()) {
            user.setCpf(request.cpf());
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.newPassword()));
        }

        userRepository.save(user);

        return ResponseEntity.ok(new UserProfileResponse(user.getName(), user.getEmail(), user.getCpf(), user.getRole()));
    }
	
	public record UserProfileResponse(String name, String email, String cpf, String role) {}
    public record UpdateProfileRequest(String name, String email, String cpf, String currentPassword, String newPassword) {}
    public record ErrorResponse(String message) {}
}
