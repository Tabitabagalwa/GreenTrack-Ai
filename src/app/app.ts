import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  authService = inject(AuthService);
  showLoginModal = signal(false);
  email = signal('');

  toggleLogin() {
    this.showLoginModal.update(v => !v);
  }

  onSendLink() {
    if (this.email()) {
      this.authService.sendLoginLink(this.email());
      this.showLoginModal.set(false);
    }
  }
}
