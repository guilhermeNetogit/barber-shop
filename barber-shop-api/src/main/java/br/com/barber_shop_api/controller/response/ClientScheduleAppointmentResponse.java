package br.com.barber_shop_api.controller.response;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ClientScheduleAppointmentResponse(
			@JsonProperty("CODAGE")
	        Long id,
	        @JsonProperty("DIA")
	        Integer dia,
	        @JsonProperty("INICIO")
	        OffsetDateTime inicio,
	        @JsonProperty("FIM")
	        OffsetDateTime fim,
	        @JsonProperty("CODCLI")
	        Long clientId,
	        @JsonProperty("NOME")
	        String clientName
		) {}
