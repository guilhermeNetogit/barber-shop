package br.com.barber_shop_api.controller.request;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;

public record SaveScheduleRequest(
		@NotNull
        @JsonProperty("INICIO")
        LocalDateTime inicio,
        @NotNull
        @JsonProperty("FIM")
        LocalDateTime fim,
        @NotNull
        @JsonProperty("CODCLI")
        Long clientId
		) {}
