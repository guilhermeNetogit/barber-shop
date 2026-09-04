package br.com.barber_shop_api.repository;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.barber_shop_api.entities.ScheduleEntity;

@Repository
public interface IScheduleRepository extends JpaRepository<IScheduleRepository, Long>{

	List<ScheduleEntity> findByStartAtGreaterThanEqualAndEndAtLessThanEqualOrderByStartAtAscEndAtAsc(
			final OffsetDateTime inicio,
			final OffsetDateTime fim);
	
	boolean existsByStartAtAndEndAt(final OffsetDateTime inicio, final OffsetDateTime fim);
}
