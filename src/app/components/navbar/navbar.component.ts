import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  currentLang: string = 'es';

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    const savedLang = localStorage.getItem('lang');
    this.currentLang = savedLang || 'es';
    this.translate.use(this.currentLang);
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
  }

  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/registro';
  }

  languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'pt', label: 'Português' }
  ];

  getFlagCode(langCode: string): string {
    if (langCode === 'en') return 'gb';
    return langCode;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Error al cerrar sesión:', err);
      }
    });
  }
}
