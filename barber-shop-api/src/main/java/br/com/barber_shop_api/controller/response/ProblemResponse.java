package br.com.barber_shop_api.controller.response;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;

@Builder(toBuilder = true)
public record ProblemResponse(
		@JsonProperty("STATUS")
        Integer status,
        @JsonProperty("TIMESTAMP")
        OffsetDateTime timestamp,
        @JsonProperty("MESSAGE")
        String message) 
{}
