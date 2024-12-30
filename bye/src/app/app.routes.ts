import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {UserComponent} from './user/user.component'
import {EventsComponent} from './events/events.component'
import {InsertEventComponent} from './insert-event/insert-event.component'
import {UserRoleFetchComponent} from './user-role-fetch/user-role-fetch.component'
import { UserDetailComponent } from './user-detail/user-detail.component';
import {EventDetailsComponent}from './event-details/event-details.component';
import {GalleryComponent} from './gallery/gallery.component';
export const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'UserComponent', component: UserComponent },
  { path: 'EventComponent', component: EventsComponent },
  { path: 'InsertEventComponent', component: InsertEventComponent },
  { path: 'UserRoleFetchComponent', component: UserRoleFetchComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'user-detail/:id', component: UserDetailComponent } ,
  { path: 'gallery', component: GalleryComponent } ,
  
  { path: 'event-details/:id', component: EventDetailsComponent },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to login by default
];
