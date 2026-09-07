package br.com.barber_shop_api.controller.request;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;

public record SaveScheduleRequest(
		@NotNull
        @JsonProperty("INICIO")
        OffsetDateTime startAt,
        @NotNull
        @JsonProperty("FIM")
        OffsetDateTime endAt,
        @NotNull
        @JsonProperty("CODCLI")
        Long clientId
		) {}
