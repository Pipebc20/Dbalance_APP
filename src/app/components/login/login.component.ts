import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  usuario = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion() {
    this.authService.login(this.usuario.email, this.usuario.password).subscribe(
      (response) => {
        localStorage.setItem('token', response.token); // Guardar token en localStorage
        this.router.navigate(['/inicio']); // Redirigir al home
      },
      (error) => {
        alert('Credenciales incorrectas');
        console.error('Error en inicio de sesión', error);
      }
    );
  }

  irARegistro() {
    this.router.navigate(['/registro']); // Redirige al formulario de registro
  }

  loginConGoogle() {
    alert('Funcionalidad de Google aún no implementada');
    // Aquí puedes integrar Firebase Authentication o Google OAuth en el futuro
  }
}
