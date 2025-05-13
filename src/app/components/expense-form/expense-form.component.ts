import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GastoService } from '../../services/gasto.service';
import { ChangeDetectorRef } from '@angular/core';
import * as Toastify from 'toastify-js';
import { TranslateService } from '@ngx-translate/core';
import { Gasto, ApiResponse } from '../../models/financial-models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit, OnDestroy {
  expenseForm: FormGroup = new FormGroup({
    categoria: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    monto: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required)
  });
  expenseId?: number;
  currentDate: string = new Date().toISOString().split('T')[0]; // Fecha actual inicial (2025-05-07)
  private dateSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gastoService: GastoService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDataIntoForm();

    // Escuchar cambios en el campo de fecha
    this.expenseForm.get('fecha')?.valueChanges.subscribe((dateValue) => {
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

  saveExpense(): void {
    if (this.expenseForm.valid) {
      const gasto = this.expenseForm.value;

      if (this.expenseId) {
        this.gastoService.actualizarGasto(this.expenseId, gasto).subscribe(
          (gastoActualizado) => {
            this.showSuccessToast('EXPENSE_UPDATED_SUCCESS');
            this.router.navigate(['/gastos']);
          },
          (error) => {
            console.error('Error al actualizar el gasto:', error);
            this.showErrorToast('EXPENSE_UPDATE_ERROR');
          }
        );
      } else {
        this.gastoService.guardarGasto(gasto).subscribe(
          (gastoGuardado) => {
            this.showSuccessToast('EXPENSE_SAVED_SUCCESS');
            this.router.navigate(['/gastos']);
          },
          (error) => {
            console.error('Error al guardar el gasto:', error);
            this.showErrorToast('EXPENSE_SAVE_ERROR'); // Mensaje específico si no se crea
          }
        );
      }
    }
  }

  hasError(field: string): boolean {
    const errorsObject = this.expenseForm.get(field)?.errors ?? {};
    const errors = Object.keys(errorsObject);
    const touched = this.expenseForm.get(field)?.touched ?? false;
    const dirty = this.expenseForm.get(field)?.dirty ?? false;
    return errors.length > 0 && (touched || dirty);
  }

  getCurrentError(field: string): string {
    const errorsObject = this.expenseForm.get(field)?.errors ?? {};
    const errors = Object.keys(errorsObject);
    return errors.length ? errors[0] : '';
  }

  getFormTitle(): string {
    return this.expenseId
      ? this.translate.instant('EDIT_EXPENSE_TITLE')
      : this.translate.instant('NEW_EXPENSE_TITLE');
  }

  private loadDataIntoForm(): void {
    this.expenseId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.expenseId) {
      this.gastoService.obtenerGasto(this.expenseId).subscribe(
        (response: ApiResponse<Gasto>) => {
          const expense = response.data;
          if (expense?.fecha) {
            expense.fecha = new Date(expense.fecha).toISOString().split('T')[0];
          }
          if (expense) {
            this.expenseForm.patchValue(expense);
          }
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error al obtener el gasto:', error);
          this.showErrorToast('EXPENSE_FETCH_ERROR');
        }
      );
    }
  }

  private validateDate(dateValue: string): void {
    const selectedDate = new Date(dateValue);
    const selectedYear = selectedDate.getFullYear();
    const minYear = 1950;
    const currentYear = new Date().getFullYear();

    if (selectedYear < minYear || selectedYear > currentYear) {
      this.showErrorToast('DATE_INVALID');
      this.expenseForm.get('fecha')?.setErrors({ invalidDate: true });
    } else {
      this.expenseForm.get('fecha')?.setErrors(null);
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
