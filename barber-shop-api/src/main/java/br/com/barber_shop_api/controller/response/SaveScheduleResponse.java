package br.com.barber_shop_api.controller.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SaveScheduleResponse(
		@JsonProperty("CODAGE")
        Long id,
        @JsonProperty("INICIO")
        String inicio,
        @JsonProperty("FIM")
        String fim,
        @JsonProperty("CODCLI")
        Long clientId) {

}
