package br.com.barber_shop_api;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.ngrok.Session;

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

	@Bean(destroyMethod = "close")
	public Session ngrokSession(@Value("${ngrok.authtoken}") String authtoken) throws Exception {
		return Session.withAuthtoken(authtoken).connect();
	}

	@Bean(destroyMethod = "close")
	public com.ngrok.Forwarder ngrokForwarder(Session session,
			@Value("${server.port:8080}") int port) throws Exception {
		var forwarder = session.httpEndpoint()
				.domain("happiness-borrower-stretch.ngrok-free.dev")
				.forward(URI.create("http://localhost:" + port).toURL());
		System.out.println("Available at: " + forwarder.getUrl());
		return forwarder;
	}
}
