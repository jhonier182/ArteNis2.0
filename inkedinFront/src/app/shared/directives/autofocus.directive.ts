import { Directive, ElementRef, OnInit } from '@angular/core';

/**
 * Directiva para hacer autofocus en un elemento al cargar
 */
@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements OnInit {
  constructor(private host: ElementRef) {}

  ngOnInit(): void {
    this.host.nativeElement.focus();
  }
}
