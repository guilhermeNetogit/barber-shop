package br.com.barber_shop_api.entities;

import java.time.OffsetDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.ToString;

@Entity
@Table(name = "TGFAGE", uniqueConstraints = {
		@UniqueConstraint(name = "UK_TGFAGE_INTERVAL", columnNames = { "INICIO", "FIM" }) })
public class ScheduleEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long CODAGE;
	
	@Column(name = "INICIO")
	private OffsetDateTime inicio;
	
	@Column(name = "FIM")
	private OffsetDateTime fim;
	
	@ToString.Exclude
	@ManyToOne
	@JoinColumn(name = "CODCLI")
	private ClientEntity client = new ClientEntity();

	@Override
	public int hashCode() {
		return Objects.hash(CODAGE, fim, inicio);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ScheduleEntity other = (ScheduleEntity) obj;
		return Objects.equals(CODAGE, other.CODAGE) && 
				Objects.equals(fim, other.fim) &&
				Objects.equals(inicio, other.inicio);
	}
}
