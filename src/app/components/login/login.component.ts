import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import Toastify from 'toastify-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';

// La librería de Google se carga con un <script> en index.html
declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });
  mostrarPassword: boolean = false;
  resetEmail: string = '';

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLDivElement>;
  @ViewChild('googleWrap') googleWrap!: ElementRef<HTMLDivElement>;
  private intentosGoogle: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private modalService: NgbModal,
    private zone: NgZone
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.iniciarGoogle();
  }

  ngOnDestroy(): void {
    clearInterval(this.intentosGoogle);
  }

  iniciarSesion(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        (response) => {
          this.showSuccessToast('LOGIN_SUCCESS');
          // No redirigir manualmente, el AuthService lo maneja
        },
        (error) => {
          console.error('Error en inicio de sesión', error);
          this.showErrorToast('LOGIN_ERROR');
        }
      );
    }
  }

  /* ========== GOOGLE ========== */

  // El script de Google carga async: se espera hasta que esté listo (máx. ~10 s)
  private iniciarGoogle(): void {
    let intentos = 0;
    this.intentosGoogle = setInterval(() => {
      intentos++;
      if (typeof google !== 'undefined' && google.accounts?.id) {
        clearInterval(this.intentosGoogle);
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (respuesta: any) => this.zone.run(() => this.alRecibirGoogle(respuesta))
        });
        this.dibujarBotonGoogle();
      } else if (intentos >= 50) {
        clearInterval(this.intentosGoogle);
        console.error('No se pudo cargar el script de Google');
      }
    }, 200);
  }

  // Dibuja el botón oficial de Google, invisible, justo encima del botón visual
  private dibujarBotonGoogle(): void {
    if (typeof google === 'undefined' || !google.accounts?.id || !this.googleBtn || !this.googleWrap) {
      return;
    }
    const contenedor = this.googleBtn.nativeElement;
    const anchoReal = this.googleWrap.nativeElement.offsetWidth || 300;
    const ancho = Math.min(Math.max(anchoReal, 200), 400); // Google acepta de 200 a 400 px

    contenedor.innerHTML = '';
    google.accounts.id.renderButton(contenedor, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: ancho
    });

    // Si el contenedor es más ancho que 400 px, se estira para cubrir todo el botón visual
    contenedor.style.transformOrigin = 'left center';
    contenedor.style.transform = anchoReal > ancho ? `scaleX(${anchoReal / ancho})` : '';
  }

  private alRecibirGoogle(respuesta: any): void {
    if (!respuesta?.credential) {
      this.showErrorToast('GOOGLE_LOGIN_ERROR');
      return;
    }
    this.authService.loginConGoogle(respuesta.credential).subscribe(
      () => {
        this.showSuccessToast('LOGIN_SUCCESS');
        // El AuthService guarda el token y redirige
      },
      (error) => {
        console.error('Error en inicio de sesión con Google', error);
        this.showErrorToast('GOOGLE_LOGIN_ERROR');
      }
    );
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  openModal(content: any): void {
    this.modalService.open(content);
  }

  resetPassword(): void {
    if (this.resetEmail) {
      this.authService.resetPassword(this.resetEmail).subscribe(
        (response) => {
          this.showSuccessToast('RESET_LINK_SENT');
          this.modalService.dismissAll();
        },
        (error) => {
          console.error('Error al enviar enlace', error);
          this.showErrorToast('RESET_LINK_ERROR');
        }
      );
    }
  }

  hasError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.errors && (control.touched || control.dirty));
  }

  getCurrentError(field: string): string {
    const errors = this.loginForm.get(field)?.errors ?? {};
    const errorKeys = Object.keys(errors);
    return errorKeys.length ? errorKeys[0] : '';
  }

  private showSuccessToast(messageKey: string): void {
    this.translate.get(messageKey).subscribe((message: string) => {
      Toastify({
        text: message,
        close: true,
        gravity: 'bottom',
        position: 'center',
        stopOnFocus: true,
        style: { background: '#189586' }
      }).showToast();
    });
  }

  private showErrorToast(messageKey: string): void {
    this.translate.get(messageKey).subscribe((message: string) => {
      Toastify({
        text: message,
        close: true,
        gravity: 'bottom',
        position: 'center',
        stopOnFocus: true,
        style: { background: '#dc3545' }
      }).showToast();
    });
  }
}
