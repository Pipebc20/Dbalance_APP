import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'budget-buddy-app';

  gastoForm: FormGroup; // Formulario para registrar gastos
  listaGastos: any[] = []; // Arreglo para almacenar los gastos

  constructor(private fb: FormBuilder) {
    // Configurar el formulario con FormBuilder
    this.gastoForm = this.fb.group({
      categoria: ['', Validators.required], // Campo obligatorio
      monto: [null, [Validators.required, Validators.min(0)]], // Validar monto como positivo
      fecha: ['', Validators.required], // Campo obligatorio
      descripcion: [''] // Descripción opcional
      });
    }

    // Método para manejar el envío del formulario
    onSubmit() {
      if (this.gastoForm.valid) {
        console.log('Formulario enviado:', this.gastoForm.value); // Depuración
        this.listaGastos.push(this.gastoForm.value);
        this.gastoForm.reset();
      } else {
        console.log('Formulario no válido');
      }
    }
  }
