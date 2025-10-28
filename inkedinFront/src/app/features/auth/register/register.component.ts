import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Crear Cuenta</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nombre</label>
            <input 
              id="name"
              type="text" 
              formControlName="name"
              placeholder="Tu nombre"
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              type="email" 
              formControlName="email"
              placeholder="tu@email.com"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              formControlName="password"
              placeholder="••••••••"
            />
          </div>
          
          <app-button 
            label="Registrarse"
            type="submit"
            variant="primary"
            size="lg"
            [disabled]="registerForm.invalid || loading"
            [loading]="loading"
          />
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    
    .register-card {
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
      box-sizing: border-box;
    }
    
    input:focus {
      outline: none;
      border-color: #007bff;
    }
    
    app-button {
      width: 100%;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const { name, email, password } = this.registerForm.value;
      
      this.authService.register(name, email, password).subscribe({
        next: (user) => {
          console.log('Registro exitoso:', user);
          this.loading = false;
          // TODO: Redirigir al dashboard o login
        },
        error: (error) => {
          console.error('Error en registro:', error);
          this.loading = false;
        }
      });
    }
  }
}
