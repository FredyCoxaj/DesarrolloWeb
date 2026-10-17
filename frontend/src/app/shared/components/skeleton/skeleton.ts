import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss'
})
export class Skeleton {
  @Input() type: 'card' | 'line' | 'circle' = 'line';
  @Input() count: number = 3;
  @Input() height: string = '60px';

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}