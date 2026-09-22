package br.com.barber_shop_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.barber_shop_api.entities.UserEntity;
import br.com.barber_shop_api.repository.IUserRepository;
import br.com.barber_shop_api.security.JwtService;

@RestController
@RequestMapping("/auth")
public class AuthController {

	public final IUserRepository userRepository;
	public final PasswordEncoder passwordEncoder;
	public final JwtService jwtService;

	public AuthController(IUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request) {
		var userOpt = userRepository.findByEmailOrName(request.login());

		if (userOpt.isEmpty() || !passwordEncoder.matches(request.password(), userOpt.get().getPassword())) {
			return ResponseEntity.status(401).body(new ErrorResponse("Usuário ou senha inválidos"));
		}

		UserEntity user = userOpt.get();
		String token = jwtService.generateToken(user.getEmail(), user.getRole());

		return ResponseEntity.ok(new LoginResponse(token, user.getName(), user.getEmail(), user.getRole()));
	}

	public record LoginRequest(String login, String password) {
	}

	public record LoginResponse(String token, String name, String email, String role) {
	}

	public record ErrorResponse(String message) {
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
		if (userRepository.findByEmail(request.email()).isPresent()) {
			return ResponseEntity.status(409).body(new ErrorResponse("E-mail já cadastrado"));
		}

		if (userRepository.findByName(request.name()).isPresent()) {
			return ResponseEntity.status(409).body(new ErrorResponse("Nome de usuário já está em uso"));
		}

		UserEntity user = new UserEntity();
		user.setName(request.name());
		user.setCpf(request.cpf());
		user.setEmail(request.email());
		user.setPassword(passwordEncoder.encode(request.password())); // Gera o hash BCrypt
		user.setRole("USER");
		user.setActive(true);

		userRepository.save(user);
		return ResponseEntity.ok("Usuário cadastrado com sucesso!");
	}

	public record RegisterRequest(String name, String email, String cpf, String password) {
	}
}
