import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  LucideTicket,
  LucideSearch,
  LucideBell,
  LucideBan,
  LucideArrowRight,
} from '@lucide/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    LucideTicket,
    LucideSearch,
    LucideBell,
    LucideBan,
    LucideArrowRight,
  ],
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