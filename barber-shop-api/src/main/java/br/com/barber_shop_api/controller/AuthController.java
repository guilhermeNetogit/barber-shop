package br.com.barber_shop_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.barber_shop_api.entities.UserEntity;
import br.com.barber_shop_api.repository.IUserRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

	public final IUserRepository userRepository;
	public final PasswordEncoder passwordEncoder;
	
	public AuthController(IUserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}
	
	@PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(401).body("Usuário ou senha inválidos");
        }

        return ResponseEntity.ok("Login efetuado com sucesso!");
    }
	
	public record LoginRequest(String email, String password) {}
	
	@PostMapping("/register")
	public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
	    UserEntity user = new UserEntity();
	            user.setName(request.name());
	            user.setCpf(request.cpf());
	            user.setEmail(request.email());
	            user.setPassword(passwordEncoder.encode(request.password())); // Gera o hash BCrypt
	            user.setRole("ADMIN");
	            user.setActive(true);

	    userRepository.save(user);
	    return ResponseEntity.ok("Usuário cadastrado com sucesso!");
	}

	public record RegisterRequest(String name, String email, String cpf, String password) {}
}
