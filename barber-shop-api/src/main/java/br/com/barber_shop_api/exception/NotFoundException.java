package br.com.barber_shop_api.exception;

public class NotFoundException extends RuntimeException {
	
	public NotFoundException(String message) {
		super(message);
	}
}
