import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../shared/components/header/header';
import { BottomNav } from '../../shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-passenger-layout',
  standalone: true,
  imports: [RouterOutlet, Header, BottomNav],
  templateUrl: './passenger-layout.html',
  styleUrl: './passenger-layout.scss'
})
export class PassengerLayout {}