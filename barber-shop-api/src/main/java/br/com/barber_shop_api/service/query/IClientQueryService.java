package br.com.barber_shop_api.service.query;

import java.util.List;

import br.com.barber_shop_api.entities.ClientEntity;

public interface IClientQueryService {

	ClientEntity findById(final long id);

    List<ClientEntity> list();

    void verifyPhone(final String phone);

    void verifyPhone(final long id,final String phone);

    void verifyEmail(final String email);

    void verifyEmail(final long id,final String email);
}
