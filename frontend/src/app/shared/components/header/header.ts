import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { LucideCircleCheck } from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideCircleCheck],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private auth = inject(Auth);
  user = this.auth.currentUser;

  logout() {
    this.auth.logout();
  }
}
