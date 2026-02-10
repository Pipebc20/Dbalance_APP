import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import Toastify from 'toastify-js';

   @Component({
     selector: 'app-registro',
     templateUrl: './registro.component.html',
     styleUrls: ['./registro.component.scss']
   })
   export class RegistroComponent implements OnInit {
     registroForm: FormGroup;
     mostrarPassword: boolean = false;
     loading: boolean = false;

     constructor(
       private fb: FormBuilder,
       private authService: AuthService,
       private router: Router,
       private translate: TranslateService
     ) {
       this.registroForm = this.fb.group(
         {
           name: ['', [Validators.required, Validators.maxLength(100)]],
           email: ['', [Validators.required, Validators.email]],
           password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
           confirmPassword: ['', Validators.required]
         },
         { validator: this.passwordsMatchValidator }
       );
     }

     ngOnInit(): void {}

     passwordsMatchValidator(group: FormGroup) {
       const password = group.get('password')?.value;
       const confirmPassword = group.get('confirmPassword')?.value;
       return password === confirmPassword ? null : { passwordsMismatch: true };
     }

     registrarUsuario(): void {
      if (this.registroForm.valid) {
        this.loading = true;
        const { name, email, password } = this.registroForm.value;
        this.authService.register(name, email, password).subscribe(
          (response) => {
            this.showSuccessToast('REGISTER_SUCCESS');
            this.loading = false;
            // No redirigir manualmente, el AuthService lo maneja
          },
          (error) => {
            console.error('Error en el registro', error);
            this.showErrorToast('REGISTER_ERROR');
            this.loading = false;
          }
        );
      }
    }

     hasError(field: string): boolean {
       const control = this.registroForm.get(field);
       return !!(control?.errors && (control.touched || control.dirty));
     }

     getCurrentError(field: string): string {
       const errors = this.registroForm.get(field)?.errors ?? {};
       if (this.registroForm.errors?.['passwordsMismatch'] && field === 'confirmPassword') {
         return 'passwordsMismatch';
       }
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
