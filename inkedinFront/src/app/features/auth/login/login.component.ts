import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Iniciar Sesión</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              type="email" 
              formControlName="email"
              placeholder="tu@email.com"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <small class="error-message">Email es requerido</small>
            }
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              formControlName="password"
              placeholder="••••••••"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <small class="error-message">Contraseña es requerida</small>
            }
          </div>
          
          <app-button 
            label="Iniciar Sesión"
            type="submit"
            variant="primary"
            size="lg"
            [disabled]="loginForm.invalid || loading"
            [loading]="loading"
          />
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: #333;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 0.375rem;
      font-size: 1rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    
    input:focus {
      outline: none;
      border-color: #007bff;
    }
    
    input.error {
      border-color: #dc3545;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      display: block;
      margin-top: 0.25rem;
    }
    
    app-button {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (user) => {
          console.log('Login exitoso:', user);
          this.loading = false;
          // TODO: Redirigir al dashboard
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.loading = false;
        }
      });
    }
  }
}
