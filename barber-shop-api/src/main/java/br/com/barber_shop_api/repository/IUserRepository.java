package br.com.barber_shop_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.barber_shop_api.entities.UserEntity;

@Repository
public interface IUserRepository extends JpaRepository<UserEntity, Long> {

	Optional<UserEntity> findByCpf(final String cpf);
	
	Optional<UserEntity> findByEmail(final String email);
	
	Optional<UserEntity> findByUsername(final String username);
	
	@Query("SELECT U FROM UserEntity U WHERE U.email = :login OR U.username = :login")
	Optional<UserEntity> findByEmailOrUsername(@Param("login") String login);
}
