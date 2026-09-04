package br.com.barber_shop_api.entities;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Entity
@Table(name = "TGFCLI", uniqueConstraints = { @UniqueConstraint(name = "PK_TGFCLI", columnNames = "CODCLI"),
		@UniqueConstraint(name = "UK_TGFCLI_EMAIL", columnNames = "EMAIL") })

@Getter
@Setter
@ToString

public class ClientEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, length = 150)
	private String name;

	@Column(nullable = false, length = 150)
	private String email;
	
	@Column(nullable = false, length = 11, columnDefinition = "bpchar(11)")
	private String phone;

	@ToString.Exclude
	@OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<ScheduleEntity> schedules = new HashSet<>();
	
	@Override
	public int hashCode() {
		return Objects.hash(id, email, name, phone);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ClientEntity other = (ClientEntity) obj;
		return Objects.equals(id, other.id)
				&& Objects.equals(email, other.email)
				&& Objects.equals(name, other.name)
				&& Objects.equals(phone, other.phone);
	}
}
