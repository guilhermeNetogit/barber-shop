package br.com.barber_shop_api.service.query.implementation;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import br.com.barber_shop_api.entities.ClientEntity;
import br.com.barber_shop_api.exception.EmailInUseException;
import br.com.barber_shop_api.exception.NotFoundException;
import br.com.barber_shop_api.exception.PhoneInUseException;
import br.com.barber_shop_api.repository.IClientRepository;
import br.com.barber_shop_api.service.query.IClientQueryService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ClientQueryService implements IClientQueryService {
	
	private final IClientRepository repository;

    @Override
    public ClientEntity findById(final long id) {
        return repository.findById(id).orElseThrow(
                () -> new NotFoundException("Não foi encontrado o cliente de id " + id)
        );
    }

    @Override
    public List<ClientEntity> list() {
        return repository.findAll();
    }

    @Override
    public void verifyPhone(final String phone) {
        if (repository.existsByPhone(phone)) {
            var message = "O telefone " + phone + " já está em uso";
            throw new PhoneInUseException(message);
        }
    }

    @Override
    public void verifyPhone(final long id, final String phone) {
        var optional = repository.findByPhone(phone);
        if (optional.isPresent() && !Objects.equals(optional.get().getId(), id)) {
            var message = "O telefone " + phone + " já está em uso";
            throw new PhoneInUseException(message);
        }
    }

    @Override
    public void verifyEmail(final String email) {
    	var cleanEmail = email.trim().toLowerCase();
        if (repository.existsByEmail(cleanEmail)) {
            var message = "O e-mail " + email + " já está em uso";
            throw new EmailInUseException(message);
        }
    }

    @Override
    public void verifyEmail(final long id, final String email) {
        var optional = repository.findByEmail(email);
        if (optional.isPresent() && !Objects.equals(optional.get().getId(), id)) {
            var message = "O e-mail " + email + " já está em uso";
            throw new EmailInUseException(message);
        }
    }

}
