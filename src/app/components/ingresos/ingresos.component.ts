import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IngresoService } from '../../services/ingreso.service';
import { ChangeDetectorRef } from '@angular/core';
import Toastify from 'toastify-js';
import { TranslateService } from '@ngx-translate/core';
import { Ingreso, ApiResponse } from '../../models/financial-models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ingreso-form',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.scss']
})
export class IngresoComponent implements OnInit, OnDestroy {
  ingresoForm: FormGroup = new FormGroup({
    categoria: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    monto: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required)
  });

  ingresoId?: number;
  formTitle: string = '';
  currentDate: string = new Date().toISOString().split('T')[0]; // Fecha actual inicial (2025-05-07)
  private dateSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ingresoService: IngresoService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDataIntoForm();
    this.setFormTitle();
    this.translate.onLangChange.subscribe(() => this.setFormTitle());

    // Escuchar cambios en el campo de fecha
    this.ingresoForm.get('fecha')?.valueChanges.subscribe((dateValue) => {
      if (dateValue) {
        this.validateDate(dateValue);
      }
    });

    // Actualizar currentDate dinámicamente cada día (simulación)
    this.updateCurrentDate();
    this.dateSubscription = this.startDateUpdateInterval();
  }

  ngOnDestroy(): void {
    this.dateSubscription.unsubscribe();
  }

  private startDateUpdateInterval(): Subscription {
    return new Subscription(); // Placeholder, no necesitamos un intervalo real aquí
    // Nota: Si quieres una actualización en tiempo real, descomenta y ajusta:
    // return interval(86400000).subscribe(() => this.updateCurrentDate());
  }

  private updateCurrentDate(): void {
    this.currentDate = new Date().toISOString().split('T')[0]; // Actualiza a la fecha actual
    this.cdr.detectChanges();
  }

  setFormTitle(): void {
    const key = this.ingresoId ? 'EDIT_INCOME_TITLE' : 'NEW_INCOME_TITLE';
    this.translate.get(key).subscribe((res: string) => {
      this.formTitle = res;
    });
  }

  saveIngreso(): void {
    if (this.ingresoForm.valid) {
      const ingreso = this.ingresoForm.value;

      if (this.ingresoId) {
        this.ingresoService.actualizarIngreso(this.ingresoId, ingreso).subscribe(
          () => {
            this.showSuccessToast('SHOW_INCOME_UPDATED');
            this.router.navigate(['/ingresos']);
          },
          (error) => {
            console.error('Error al actualizar el ingreso:', error);
            this.showErrorToast('INCOME_UPDATE_ERROR');
          }
        );
      } else {
        this.ingresoService.guardarIngreso(ingreso).subscribe(
          () => {
            this.showSuccessToast('INCOME_SAVED');
            this.router.navigate(['/ingresos']);
          },
          (error) => {
            console.error('Error al guardar el ingreso:', error);
            this.showErrorToast('INCOME_SAVE_ERROR'); // Mensaje específico si no se crea
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

  private loadDataIntoForm(): void {
    this.ingresoId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.ingresoId) {
      this.ingresoService.obtenerIngreso(this.ingresoId).subscribe({
        next: (response: any) => {
          console.log('Respuesta del API:', response);

          const ingreso = this.getIngresoFromResponse(response);

          if (ingreso) {
            const ingresoFormatted: Ingreso = {
              categoria: ingreso.categoria || '',
              monto: ingreso.monto || 0,
              descripcion: ingreso.descripcion || '',
              fecha: ingreso.fecha ? new Date(ingreso.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              id: ingreso.id
            };

            this.ingresoForm.patchValue(ingresoFormatted);
            this.cdr.detectChanges();
            this.setFormTitle();
          }
        },
        error: (err) => {
          console.error('Error al obtener el ingreso:', err);
          this.showErrorToast('INCOME_FETCH_ERROR');
        }
      });
    }
  }

  private getIngresoFromResponse(response: any): any {
    if (response && (response.categoria !== undefined || response.monto !== undefined)) {
      return response;
    }
    if (response.data) return response.data;
    if (response.result) return response.result;
    if (response.item) return response.item;

    console.warn('No se pudo extraer el ingreso de la respuesta:', response);
    return null;
  }

  private validateDate(dateValue: string): void {
    const selectedDate = new Date(dateValue);
    const selectedYear = selectedDate.getFullYear();
    const minYear = 1950;
    const currentYear = new Date().getFullYear();

    if (selectedYear < minYear || selectedYear > currentYear) {
      this.showErrorToast('DATE_INVALID');
      this.ingresoForm.get('fecha')?.setErrors({ invalidDate: true });
    } else {
      this.ingresoForm.get('fecha')?.setErrors(null);
    }
  }

  private showSuccessToast(message: string): void {
    Toastify({
      text: this.translate.instant(message),
      close: true,
      gravity: "bottom",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "#189586",
      }
    }).showToast();
  }

  private showErrorToast(message: string): void {
    Toastify({
      text: this.translate.instant(message),
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#ff4444",
      stopOnFocus: true
    }).showToast();
  }
}
