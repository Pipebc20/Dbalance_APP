import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registroForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    @Inject(AuthService) private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required] // Agregado
      },
      { validator: this.passwordsMatchValidator }
    );
  }

  // Validador para asegurar que las contraseñas coincidan
  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  registrarUsuario() {
    if (this.registroForm.valid) {
      this.loading = true;
      const { name, email, password } = this.registroForm.value;

      this.authService.register(name, email, password).subscribe(
        (response: any) => {
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          this.router.navigate(['/login']);
        },
        (error: any) => {
          console.error('Error en el registro', error);
          alert('Error en el registro. Inténtalo de nuevo.');
          this.loading = false;
        }
      );
    }
  }
}
