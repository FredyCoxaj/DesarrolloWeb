import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

interface Seat {
  number: number;
  occupied: boolean;
}

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [],
  templateUrl: './seat-map.html',
  styleUrl: './seat-map.scss'
})
export class SeatMap {
  @Input() totalSeats: number = 40;
  @Input() occupiedSeats: number[] = [];
  @Output() seatSelected = new EventEmitter<number>();

  selectedSeat = signal<number | null>(null);

  get seats(): Seat[] {
    return Array.from({ length: this.totalSeats }, (_, i) => ({
      number: i + 1,
      occupied: this.occupiedSeats.includes(i + 1),
    }));
  }

  get rows(): Seat[][] {
    const all = this.seats;
    const rows: Seat[][] = [];
    for (let i = 0; i < all.length; i += 4) {
      rows.push(all.slice(i, i + 4));
    }
    return rows;
  }

  selectSeat(seat: Seat) {
    if (seat.occupied) return;
    this.selectedSeat.set(seat.number);
    this.seatSelected.emit(seat.number);
  }
}