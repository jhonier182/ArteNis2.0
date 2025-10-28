import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="getButtonClasses()"
      [disabled]="disabled"
      [type]="type"
      (click)="onClick.emit($event)">
      @if (loading) {
        <span class="spinner"></span>
      }
      <span [class.hidden]="loading">{{ label || 'Button' }}</span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 500;
      border-radius: 0.375rem;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
      outline: none;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    button:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .hidden {
      display: none;
    }
    
    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Variants */
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .btn-danger:hover:not(:disabled) {
      background-color: #c82333;
    }
    
    .btn-outline {
      background-color: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }
    
    .btn-outline:hover:not(:disabled) {
      background-color: #007bff;
      color: white;
    }
    
    /* Sizes */
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
    
    .btn-md {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
    
    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1.125rem;
    }
  `]
})
export class ButtonComponent {
  @Input() label?: string;
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  
  @Output() onClick = new EventEmitter<MouseEvent>();
  
  getButtonClasses(): string {
    return `btn-${this.variant} btn-${this.size}`;
  }
}
