package br.com.barber_shop_api.mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import br.com.barber_shop_api.controller.request.SaveScheduleRequest;
import br.com.barber_shop_api.controller.response.ClientScheduleAppointmentResponse;
import br.com.barber_shop_api.controller.response.SaveScheduleResponse;
import br.com.barber_shop_api.controller.response.ScheduleAppointmentMonthResponse;
import br.com.barber_shop_api.entities.ScheduleEntity;

@Mapper(componentModel = SPRING)
public interface IScheduleMapper {

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "client.id", ignore = true)
	ScheduleEntity toEntity(final SaveScheduleRequest request);

	@Mapping(target = "clientId", source = "client.id")
	SaveScheduleResponse toSaveResponse(final ScheduleEntity entity);

	@Mapping(target = "scheduledAppointments", expression = "java(toClientMonthResponse(entities))")
	ScheduleAppointmentMonthResponse toMonthResponse(final int year, final int month,
			final List<ScheduleEntity> entities);

	List<ClientScheduleAppointmentResponse> toClientMonthResponse(final List<ScheduleEntity> entities);

	@Mapping(target = "clientId", source = "client.id")
	@Mapping(target = "clientName", source = "client.name")
	@Mapping(target = "day", expression = "java(entity.getStartAt().getDayOfMonth())")
	ClientScheduleAppointmentResponse toClientMonthResponse(final ScheduleEntity entity);

}
