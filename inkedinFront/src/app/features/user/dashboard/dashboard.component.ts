import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <div class="dashboard-content">
        <p>Bienvenido a tu panel de control.</p>
        <p>Aquí podrás ver estadísticas y gestionar tu cuenta.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      margin-bottom: 1.5rem;
      color: #333;
    }
    
    .dashboard-content {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class DashboardComponent {
}
