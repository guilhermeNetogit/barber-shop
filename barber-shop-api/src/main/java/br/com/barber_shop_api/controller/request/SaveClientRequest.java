package br.com.barber_shop_api.controller.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SaveClientRequest(
		@NotBlank
        String name,
        
        @NotBlank
        @Email
        String email,
        
        @NotBlank
        String phone
) {}
