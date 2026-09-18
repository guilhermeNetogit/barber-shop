package br.com.barber_shop_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.barber_shop_api.entities.UserEntity;

@Repository
public interface IUserRepository extends JpaRepository<UserEntity, Long> {

	boolean existsByEmail(final String email);

	Optional<UserEntity> findByEmail(final String email);
}
