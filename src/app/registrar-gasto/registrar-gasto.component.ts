import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GastoService } from '../services/gasto.service';

@Component({
  selector: 'app-registrar-gasto',
  templateUrl: './registrar-gasto.component.html',
  styleUrls: ['./registrar-gasto.component.scss'],
})
export class RegistrarGastoComponent implements OnInit {
  gastoForm: FormGroup;
  listaGastos: any[] = [];

  constructor(private fb: FormBuilder, private gastoService: GastoService) {
    // Crear el formulario reactivo
    this.gastoForm = this.fb.group({
      categoria: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      fecha: ['', Validators.required],
      descripcion: [''],
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.gastoForm.valid) {
      const nuevoGasto = this.gastoForm.value;

      this.gastoService.guardarGasto(nuevoGasto).subscribe(
        (gastoGuardado) => {
          this.listaGastos.push(gastoGuardado);

          this.gastoForm.reset();

          alert('¡Gasto guardado exitosamente!');
        },
        (error) => {
          console.error('Error al guardar el gasto:', error);
          alert('Hubo un error al guardar el gasto.');
        }
      );
    }
  }
}
