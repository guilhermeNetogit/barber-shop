package br.com.barber_shop_api.controller;

import static java.time.ZoneOffset.UTC;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.NO_CONTENT;

import java.time.YearMonth;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.barber_shop_api.controller.request.SaveScheduleRequest;
import br.com.barber_shop_api.controller.response.SaveScheduleResponse;
import br.com.barber_shop_api.controller.response.ScheduleAppointmentMonthResponse;
import br.com.barber_shop_api.mapper.IScheduleMapper;
import br.com.barber_shop_api.service.IScheduleService;
import br.com.barber_shop_api.service.query.IScheduleQueryService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("schedules")
@AllArgsConstructor
public class ScheduleController {

	private final IScheduleService service;
	private final IScheduleQueryService queryService;
	private final IScheduleMapper mapper;

	@PostMapping
	@ResponseStatus(CREATED)
	SaveScheduleResponse save(@RequestBody @Valid SaveScheduleRequest request) {
		var entity = mapper.toEntity(request);
		service.save(entity);
		return mapper.toSaveResponse(entity);
	}

	@DeleteMapping("{id}")
	@ResponseStatus(NO_CONTENT)
	void delete(@PathVariable final long id) {
		service.delete(id);
	}

	@GetMapping("{year}/{month}")
	ScheduleAppointmentMonthResponse listMonth(@PathVariable final int year, @PathVariable final int month) {
		var yearMonth = YearMonth.of(year, month);
		var startAt = yearMonth.atDay(1).atTime(0, 0, 0, 0).atOffset(UTC);
		var endAt = yearMonth.atEndOfMonth().atTime(23, 59, 59, 999_999_999).atOffset(UTC);
		var entities = queryService.findInMonth(startAt, endAt);
		return mapper.toMonthResponse(year, month, entities);
	}
}