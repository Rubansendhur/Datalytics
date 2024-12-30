// src/app/app.routing.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 // Adjust path as necessary
import { UserFormComponent } from './user-form/user-form.component'; // Adjust path as necessary
import {ProductFormComponent} from './product-form/product-form.component'

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
export const routes: Routes = [
  //{ path: '', redirectTo: '/home', pathMatch: 'full' },
 
  { path: 'user-form', component: UserFormComponent },
  { path: 'product-form', component: ProductFormComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
