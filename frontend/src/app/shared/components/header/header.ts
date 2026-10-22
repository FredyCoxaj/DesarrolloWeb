import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/services/auth';
//import { RoleSwitcher } from '../role-switcher/role-switcher';
import { LucideCircleCheck, LucideSettings } from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideCircleCheck, LucideSettings],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private auth = inject(Auth);
  user = this.auth.currentUser;
}
