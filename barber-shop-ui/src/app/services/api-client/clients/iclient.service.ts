import { Observable } from 'rxjs';
import {
  FindIdClientResponse,
  ListClientResponse,
  SaveClientRequest,
  SaveClientResponse,
  UpdateClientRequest,
  UpdateClientResponse,
} from './client.models';

export interface IClientService {
  save(request: SaveClientRequest): Observable<SaveClientResponse>;

  update(id: number, request: UpdateClientRequest): Observable<UpdateClientResponse>;

  delete(id: number): Observable<void>;

  list(): Observable<ListClientResponse>;

  findById(id: number): Observable<FindIdClientResponse>;

  listByEmail(email: string): Observable<SaveClientResponse[]>;
}
