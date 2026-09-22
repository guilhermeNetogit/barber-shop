package br.com.barber_shop_api.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TSIUSU")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "CODUSU")
	private Long id;

	@Column(name = "NOMEUSU", nullable = false, unique = true)
	private String name;

	@Column(name = "CPF", nullable = false, unique = true, length = 11)
	private String cpf;

	@Column(name = "EMAIL", nullable = false, unique = true)
	private String email;

	@Column(name = "INTERNO", nullable = false)
	private String password;

	@Column(name = "ROLEUSU", nullable = false)
	private String role;

	@Column(name = "ATIVO", nullable = false)
	private Boolean active;
}
