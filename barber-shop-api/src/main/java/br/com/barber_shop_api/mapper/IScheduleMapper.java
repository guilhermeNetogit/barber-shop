package br.com.barber_shop_api.mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

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
	@Mapping(target = "inicio", source = "inicio", qualifiedByName = "offsetToString")
	@Mapping(target = "fim", source = "fim", qualifiedByName = "offsetToString")
	SaveScheduleResponse toSaveResponse(final ScheduleEntity entity);

	@Mapping(target = "scheduledAppointments", expression = "java(toClientMonthResponse(entities))")
	ScheduleAppointmentMonthResponse toMonthResponse(final int year, final int month,
			final List<ScheduleEntity> entities);

	List<ClientScheduleAppointmentResponse> toClientMonthResponse(final List<ScheduleEntity> entities);

	@Mapping(target = "clientId", source = "client.id")
	@Mapping(target = "clientName", source = "client.name")
	@Mapping(target = "dia", expression = "java(entity.getInicio().getDayOfMonth())")
	ClientScheduleAppointmentResponse toClientMonthResponse(final ScheduleEntity entity);

	@Named("offsetToString")
	default String offsetToString(OffsetDateTime value) {
		return value != null ? value.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) : null;
	}

}
