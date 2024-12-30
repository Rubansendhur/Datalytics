import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root', // Use 'root' to provide the service at the application level
})
export class ItemService {
  constructor() {}

  getItems(): Observable<any[]> {
    console.log('hi'); // Print "hi" to the console

    // Static list of items
    const items = [
      { id: 1, name: 'Item 1' ,Helo:'Bhai'},
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
      { id: 4, name: 'Item 4' }
    ];

    return of(items); // Return an observable of the static items array
  }
}
