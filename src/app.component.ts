
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
})
export class AppComponent {
  isToolsDropdownOpen = signal(false);

  toggleToolsDropdown(): void {
    this.isToolsDropdownOpen.update(v => !v);
  }

  closeToolsDropdown(): void {
    this.isToolsDropdownOpen.set(false);
  }
}
