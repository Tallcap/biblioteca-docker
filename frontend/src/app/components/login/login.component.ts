import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);

  // Modo actual: 'login' o 'registro'
  modo: 'login' | 'registro' = 'login';

  // Campos para Login
  username = '';
  password = '';

  // Campos para Registro
  regNombreCompleto = '';
  regUsername = '';
  regPassword = '';
  regConfirmPassword = '';

  // Estados de interfaz
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  ngOnInit(): void {
    // Si ya tiene sesion activa, no debe estar en login
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/libros']);
    }
  }

  cambiarModo(nuevoModo: 'login' | 'registro'): void {
    this.modo = nuevoModo;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Accion de Inicio de Sesion
  iniciarSesion(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Por favor ingrese su usuario y contraseña.';
      return;
    }

    this.isLoading = true;

    this.authService.login({ username: this.username.trim(), password: this.password }).pipe(finalize(() => this.finalizarSolicitud())).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/libros']);
        } else {
          this.errorMessage = res.message || 'Contraseña incorrecta. Por favor ingrese la contraseña real.';
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = err.error?.message || 'Contraseña incorrecta. Por favor ingrese la contraseña real.';
        } else {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.';
        }
      }
    });
  }

  // Accion de Registro de Nuevo Usuario
  registrarUsuario(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.regNombreCompleto.trim() || !this.regUsername.trim() || !this.regPassword || !this.regConfirmPassword) {
      this.errorMessage = 'Por favor complete todos los campos requeridos.';
      return;
    }

    if (this.regPassword.length < 4) {
      this.errorMessage = 'La contraseña debe tener al menos 4 caracteres.';
      return;
    }

    // VALIDACION ESTRICTA DE CONTRASEÑA
    if (this.regPassword !== this.regConfirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden. Por favor confirme su contraseña real correctamente.';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      nombreCompleto: this.regNombreCompleto.trim(),
      username: this.regUsername.trim(),
      password: this.regPassword,
      confirmPassword: this.regConfirmPassword
    }).pipe(finalize(() => this.finalizarSolicitud())).subscribe({
      next: (res) => {
        if (res.success) {
          // Sesion iniciada correctamente tras el registro
          this.router.navigate(['/libros']);
        } else {
          this.errorMessage = res.message || 'Error al registrar el usuario.';
        }
      },
      error: (err) => {
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Error al registrar el usuario. Compruebe los datos e inténtelo de nuevo.';
        }
      }
    });
  }

  private finalizarSolicitud(): void {
    this.isLoading = false;
    this.changeDetector.markForCheck();
  }
}
