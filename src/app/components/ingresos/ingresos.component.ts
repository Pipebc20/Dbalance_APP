import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IngresoService } from '../../services/ingreso.service';
import { ChangeDetectorRef } from '@angular/core';
import * as Toastify from 'toastify-js';

@Component({
  selector: 'app-ingreso-form',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.scss']
})
export class IngresoComponent implements OnInit {
  ingresoForm: FormGroup = new FormGroup({
    categoria: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    monto: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required)
  });
  ingresoId?: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ingresoService: IngresoService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDataIntoForm();
    this.ingresoService.obtenerIngresos().subscribe(data => {
      console.log('Ingresos:', data);
    });
  }

  saveIngreso(): void {
    if (this.ingresoForm.valid) {
      const ingreso = this.ingresoForm.value;

      if (this.ingresoId) {
        this.ingresoService.actualizarIngreso(this.ingresoId, ingreso).subscribe(
          () => {
            this.showSuccessToast('¡Ingreso actualizado exitosamente!');
            this.router.navigate(['/ingresos']);
          },
          (error) => {
            console.error('Error al actualizar el ingreso:', error);
            alert('Hubo un error al actualizar el ingreso.');
          }
        );
      } else {
        this.ingresoService.guardarIngreso(ingreso).subscribe(
          () => {
            this.showSuccessToast('¡Ingreso guardado exitosamente!');
            this.router.navigate(['/ingresos']);
          },
          (error) => {
            console.error('Error al guardar el ingreso:', error);
            alert('Hubo un error al guardar el ingreso.');
          }
        );
      }
    }
  }

  hasError(field: string): boolean {
    const errorsObject = this.ingresoForm.get(field)?.errors ?? {};
    const errors = Object.keys(errorsObject);
    return errors.length > 0 && (!!this.ingresoForm.get(field)?.touched || !!this.ingresoForm.get(field)?.dirty);
  }

  getCurrentError(field: string): string {
    const errorsObject = this.ingresoForm.get(field)?.errors ?? {};
    const errors = Object.keys(errorsObject);
    return errors.length ? errors[0] : '';
  }

  getFormTitle(): string {
    return this.ingresoId ? 'Editar ingreso' : 'Nuevo ingreso';
  }

  private loadDataIntoForm(): void {
    this.ingresoId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.ingresoId) {
      this.ingresoService.obtenerIngreso(this.ingresoId).subscribe(ingreso => {
        if (ingreso.fecha) {
          ingreso.fecha = new Date(ingreso.fecha).toISOString().split('T')[0];
        }
        this.ingresoForm.patchValue(ingreso);
        this.cdr.detectChanges();
      }, (error) => {
        console.error('Error al obtener el ingreso:', error);
      });
    }
  }

  private showSuccessToast(message: string): void {
    Toastify({
      text: message,
      close: true,
      gravity: "bottom",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "#189586",
      }
    }).showToast();
  }
}
