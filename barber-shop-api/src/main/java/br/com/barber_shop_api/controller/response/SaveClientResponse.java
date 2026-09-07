package br.com.barber_shop_api.controller.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SaveClientResponse(
		@JsonProperty("CODCLI")
        Long id,
        @JsonProperty("NOME")
        String name,
        @JsonProperty("EMAIL")
        String email,
        @JsonProperty("TELEFONE")
        String phone) {

}
