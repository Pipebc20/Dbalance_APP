import { Component, OnInit } from '@angular/core';
import { GastoService } from '../../services/gasto.service';
import { TranslateService } from '@ngx-translate/core';
import Toastify from 'toastify-js';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'; // Ajusta la ruta

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  total: number = 0;

  constructor(
    private gastoService: GastoService,
    private translate: TranslateService,
    private dialog: MatDialog // Inyecta MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerGastos();
  }

  obtenerGastos(): void {
    this.gastoService.obtenerGastos().subscribe(
      (response) => {
        if (response && response.data) {
          this.expenses = response.data;
          this.calcularTotal();
        }
      },
      (error) => {
        console.error('Error al obtener los gastos:', error);
        this.showErrorToast('EXPENSE_FETCH_ERROR');
      }
    );
  }

  calcularTotal(): void {
    this.total = this.expenses.reduce((sum, expense) => sum + parseFloat(expense.monto), 0);
  }

  deleteExpense(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: this.translate.instant('CONFIRM_DELETE_EXPENSE') }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gastoService.eliminarGasto(id).subscribe(
          () => {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.calcularTotal();
            this.showSuccessToast('EXPENSE_DELETED_SUCCESS');
          },
          (error) => {
            console.error('Error al eliminar el gasto:', error);
            this.showErrorToast('EXPENSE_DELETE_ERROR');
          }
        );
      }
    });
  }

  private showSuccessToast(message: string): void {
    Toastify({
      text: this.translate.instant(message),
      close: true,
      gravity: "bottom",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "#189586", // Verde para mensajes positivos
      }
    }).showToast();
  }

  private showErrorToast(message: string): void {
    Toastify({
      text: this.translate.instant(message),
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#ff4444", // Rojo para errores
      stopOnFocus: true
    }).showToast();
  }
}
