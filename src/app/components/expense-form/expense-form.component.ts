import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GastoService } from '../../services/gasto.service';
import { ChangeDetectorRef } from '@angular/core';
import * as Toastify from 'toastify-js';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup = new FormGroup({
    categoria: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    monto: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required)
  });
  expenseId?: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gastoService: GastoService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDataIntoForm();
  }

  saveExpense(): void {
    if (this.expenseForm.valid) {
      const gasto = this.expenseForm.value;

      if (this.expenseId) {
        this.gastoService.actualizarGasto(this.expenseId, gasto).subscribe(
          (gastoActualizado) => {
            this.showSuccessToast('¡Gasto actualizado exitosamente!');
            this.router.navigate(['/gastos']);
          },
          (error) => {
            console.error('Error al actualizar el gasto:', error);
            alert('Hubo un error al actualizar el gasto.');
          }
        );
      } else {
        this.gastoService.guardarGasto(gasto).subscribe(
          (gastoGuardado) => {
            this.showSuccessToast('¡Gasto guardado exitosamente!');
            this.router.navigate(['/gastos']);
          },
          (error) => {
            console.error('Error al guardar el gasto:', error);
            alert('Hubo un error al guardar el gasto.');
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
    return this.expenseId ? 'Editar gasto' : 'Nuevo gasto';
  }

  private loadDataIntoForm(): void {
    this.expenseId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.expenseId) {
      this.gastoService.obtenerGasto(this.expenseId).subscribe(expense => {
        if (expense.fecha) {
          expense.fecha = new Date(expense.fecha).toISOString().split('T')[0];
        }
        this.expenseForm.patchValue(expense);
        this.cdr.detectChanges();
        console.log(expense);
      }, (error) => {
        console.error('Error al obtener el gasto:', error);
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
