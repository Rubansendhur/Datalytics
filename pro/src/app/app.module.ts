import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component'; // Import LoginComponent

@NgModule({
  declarations: [
    AppComponent,
    //LoginComponent // Ensure LoginComponent is declared here
  ],
  imports: [
    BrowserModule,
    FormsModule // Add FormsModule for ngModel
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
