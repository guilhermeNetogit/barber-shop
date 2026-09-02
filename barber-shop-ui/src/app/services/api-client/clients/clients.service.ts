import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IClientService } from './iclient.service';
import { Observable } from 'rxjs';
import { SaveClientRequest, SaveClientResponse, UpdateClientRequest, UpdateClientResponse, ListClientResponse, FindIdClientResponse } from './client.models';
import { environment } from '../../../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ClientsService implements IClientService {
  private readonly resourceUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  save(request: SaveClientRequest): Observable<SaveClientResponse> {
    return this.http.post<SaveClientResponse>(`${this.resourceUrl}clients`, request);
  }

  update(id: number, request: UpdateClientRequest): Observable<UpdateClientResponse> {
    return this.http.put<UpdateClientResponse>(`${this.resourceUrl}clients/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}clients/${id}`);
  }

  list(): Observable<ListClientResponse> {
    return this.http.get<ListClientResponse>(`${this.resourceUrl}clients`)
  }

  listByEmail(email: string): Observable<SaveClientResponse[]> {
    return this.http.get<SaveClientResponse[]>(`${this.resourceUrl}clients?email=${email}`);
  }

  findById(id: number): Observable<FindIdClientResponse> {
    return this.http.get<FindIdClientResponse>(`${this.resourceUrl}clients/${id}`);
  }

}
