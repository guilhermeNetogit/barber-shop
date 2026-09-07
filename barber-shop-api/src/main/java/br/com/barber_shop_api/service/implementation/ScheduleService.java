package br.com.barber_shop_api.service.implementation;

import org.springframework.stereotype.Service;

import br.com.barber_shop_api.entities.ScheduleEntity;
import br.com.barber_shop_api.repository.IScheduleRepository;
import br.com.barber_shop_api.service.IScheduleService;
import br.com.barber_shop_api.service.query.IScheduleQueryService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ScheduleService implements IScheduleService {

    private final IScheduleRepository repository;
    private final IScheduleQueryService queryService;

    @Override
    public ScheduleEntity save(final ScheduleEntity entity) {
        queryService.verifyIfScheduleExists(entity.getInicio(), entity.getFim());

        return repository.save(entity);
    }

    @Override
    public void delete(final long id) {
        queryService.findById(id);
        repository.deleteById(id);
    }
}