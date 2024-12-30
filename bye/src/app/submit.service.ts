import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmitService {
  private apiUrl = 'http://localhost:5000/submit';

  constructor(private http: HttpClient) {}

  submitData(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
