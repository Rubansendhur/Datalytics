// src/app/app.module.ts
// Ensure the path is correct
import { AppComponent } from './app.component';
 // Adjust as necessary

// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routing'; // Ensure this is correct
import { UserFormComponent } from './user-form/user-form.component'; // Adjust as necessary
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    // UserFormComponent, // No need to declare AppComponent if it is standalone
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
    // AppComponent if not standalone
  ],
  providers: [],
  bootstrap: [AppComponent] // This remains
})
export class AppModule { }

