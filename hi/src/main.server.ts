// src/main.server.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routing'; // Import your routes
import { provideRouter } from '@angular/router'; // Import provideRouter

const bootstrapServerApp = () => {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes), // Add routing support here
      // Include additional providers if necessary
    ],
  });
};

export default bootstrapServerApp; // Use a unique name for the export
