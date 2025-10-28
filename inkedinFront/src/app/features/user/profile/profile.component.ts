import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h1>Mi Perfil</h1>
      <div class="profile-content">
        <p>Esta es la página de perfil del usuario.</p>
        <p>Aquí se mostrará la información del usuario autenticado.</p>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      margin-bottom: 1.5rem;
      color: #333;
    }
    
    .profile-content {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class ProfileComponent {
}
