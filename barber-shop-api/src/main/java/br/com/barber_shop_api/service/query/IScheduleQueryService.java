package br.com.barber_shop_api.service.query;

import java.time.OffsetDateTime;
import java.util.List;

import br.com.barber_shop_api.entities.ScheduleEntity;

public interface IScheduleQueryService {

	ScheduleEntity findById(final long id);

    List<ScheduleEntity> findInMonth(final OffsetDateTime inicio, final OffsetDateTime fim);

    void verifyIfScheduleExists(final OffsetDateTime inicio, final OffsetDateTime fim);
}
