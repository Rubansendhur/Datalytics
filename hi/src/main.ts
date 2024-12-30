// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app.routing'; // Import AppRoutingModule
import { provideRouter } from '@angular/router'; // Import provideRouter
import { routes } from './app/app.routing'; // Make sure you have a file exporting routes
import { AppModule } from './app/app.module'; // Correct import path

// Bootstrap the application
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Provide the routes directly
    // Add other providers here if necessary
  ],
})
  .catch((err) => console.error(err));
