package br.com.barber_shop_api.service;

import br.com.barber_shop_api.entities.ClientEntity;

public interface IClientService {

	ClientEntity save(final ClientEntity entity);

    ClientEntity update(final ClientEntity entity);

    void delete(final long id);
}
