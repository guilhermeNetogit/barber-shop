package br.com.barber_shop_api;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BarberShopApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BarberShopApiApplication.class, args);
	}

	@Bean
	public CommandLineRunner databaseConnectionSuccessChecker() {
		return args -> {
			System.out.println("\n====================================================");
			System.out.println("Conexão com o banco de dados realizada com sucesso!");
			System.out.println("====================================================\n");
		};
	}
}
