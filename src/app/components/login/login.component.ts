import { Component, OnInit } from '@angular/core';
   import { FormControl, FormGroup, Validators } from '@angular/forms';
   import { Router } from '@angular/router';
   import { AuthService } from '../../services/auth.service';
   import { TranslateService } from '@ngx-translate/core';
   import * as Toastify from 'toastify-js';
   import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

   @Component({
     selector: 'app-login',
     templateUrl: './login.component.html',
     styleUrls: ['./login.component.scss']
   })
   export class LoginComponent implements OnInit {
     loginForm: FormGroup = new FormGroup({
       email: new FormControl('', [Validators.required, Validators.email]),
       password: new FormControl('', [Validators.required, Validators.minLength(6)])
     });
     mostrarPassword: boolean = false;
     resetEmail: string = '';

     constructor(
       private authService: AuthService,
       private router: Router,
       private translate: TranslateService,
       private modalService: NgbModal
     ) {}

     ngOnInit(): void {}

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

     loginConGoogle(): void {
       this.showErrorToast('GOOGLE_LOGIN_NOT_IMPLEMENTED');
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
