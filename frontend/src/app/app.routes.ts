import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LibrosComponent } from './components/libros/libros.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'libros', component: LibrosComponent, canActivate: [authGuard] },
  // Al ingresar directamente va al login por defecto
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
