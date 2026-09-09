package br.com.barber_shop_api.service.implementation;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.barber_shop_api.entities.ClientEntity;
import br.com.barber_shop_api.entities.ScheduleEntity;
import br.com.barber_shop_api.exception.NotFoundException; // Sua classe de exceção de 404
import br.com.barber_shop_api.repository.IClientRepository;
import br.com.barber_shop_api.repository.IScheduleRepository;
import br.com.barber_shop_api.service.IScheduleService;
import br.com.barber_shop_api.service.query.IScheduleQueryService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ScheduleService implements IScheduleService {

    private final IScheduleRepository repository;
    private final IScheduleQueryService queryService;
    private final IClientRepository clientRepository; // Injete o repositório de clientes

    @Override
    @Transactional
    public ScheduleEntity save(final ScheduleEntity entity) {
        queryService.verifyIfScheduleExists(entity.getInicio(), entity.getFim());

        // 1. Pega o ID do cliente passado no objeto
        Long clientId = entity.getClient() != null ? entity.getClient().getId() : null;

        if (clientId == null) {
            throw new IllegalArgumentException("O ID do cliente não pode ser nulo");
        }

        // 2. Busca a entidade CLIENTE gerenciada pelo EntityManager do JPA
        ClientEntity clientManaged = clientRepository.findById(clientId)
                .orElseThrow(() -> new NotFoundException("Cliente não encontrado com o ID: " + clientId));

        // 3. Substitui a instância solta (transiente) pela instância gerenciada
        entity.setClient(clientManaged);

        // 4. Salva o agendamento
        return repository.save(entity);
    }

    @Override
    public void delete(final long id) {
        queryService.findById(id);
        repository.deleteById(id);
    }
}