package br.com.barber_shop_api.mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import br.com.barber_shop_api.controller.request.SaveClientRequest;
import br.com.barber_shop_api.controller.request.UpdateClientRequest;
import br.com.barber_shop_api.controller.response.ClientDetailResponse;
import br.com.barber_shop_api.controller.response.ListClientResponse;
import br.com.barber_shop_api.controller.response.SaveClientResponse;
import br.com.barber_shop_api.controller.response.UpdateClientResponse;
import br.com.barber_shop_api.entities.ClientEntity;

@Mapper(componentModel = SPRING)
public interface IClientMapper {
	
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "schedules", ignore = true)
	ClientEntity toEntity(final SaveClientRequest request);
	
	SaveClientResponse toSaveResponse(final ClientEntity entity);
	
	@Mapping(target = "schedules", ignore = true)
    ClientEntity toEntity(final long id, final UpdateClientRequest request);

    UpdateClientResponse toUpdateResponse(final ClientEntity entity);

    ClientDetailResponse toDetailResponse(final ClientEntity entity);

    List<ListClientResponse> toListResponse(final List<ClientEntity> entities);

}
