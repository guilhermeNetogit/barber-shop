package br.com.barber_shop_api.controller.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record UpdateClientRequest(
		@NotNull
        @JsonProperty("NOME")
        String name,
        @NotNull
        @Email
        @JsonProperty("EMAIL")
        String email,
        @NotNull
        @JsonProperty("TELEFONE")
        String phone
		) {}
