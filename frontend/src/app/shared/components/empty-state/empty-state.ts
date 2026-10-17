import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss'
})
export class EmptyState {
  @Input() icon: string = '📭';
  @Input() title: string = 'Nada por aquí';
  @Input() message: string = '';
  @Input() actionLabel: string = '';
  @Output() actionClick = new EventEmitter<void>();
}