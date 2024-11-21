import { Component, OnInit } from '@angular/core';
import { GastoService } from '../../services/gasto.service';


@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  total: number = 0;

  constructor(private gastoService: GastoService) {}

  ngOnInit(): void {
    this.obtenerGastos();
  }

  obtenerGastos(): void {
    this.gastoService.obtenerGastos().subscribe(response => {
      if (response && response.data) {
        this.expenses = response.data;
        this.calcularTotal();
      }
    });
  }

  calcularTotal(): void {
    this.total = this.expenses.reduce((sum, expense) => sum + parseFloat(expense.monto), 0);
  }

  deleteExpense(id: number): void {
    this.gastoService.eliminarGasto(id).subscribe(() => {
      this.expenses = this.expenses.filter(expense => expense.id !== id);
      this.calcularTotal();
    });
  }
}
