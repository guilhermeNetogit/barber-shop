package br.com.barber_shop_api.controller.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SaveScheduleResponse(
		@JsonProperty("id") Long codage,
		@JsonProperty("day") Integer dia,
		@JsonProperty("startAt") String inicio,
		@JsonProperty("endAt") String fim, 
		@JsonProperty("clientId") Long codcli,
		@JsonProperty("clientName") String nome) {

}
