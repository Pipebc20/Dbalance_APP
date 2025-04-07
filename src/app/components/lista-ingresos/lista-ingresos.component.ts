import { Component, OnInit } from '@angular/core';
import { IngresoService } from '../../services/ingreso.service';

@Component({
  selector: 'app-lista-ingresos',
  templateUrl: './lista-ingresos.component.html',
  styleUrls: ['./lista-ingresos.component.scss']
})
export class ListaIngresosComponent implements OnInit {
    expenses: any[] = [];
    total: number = 0;
    ingresos: any[] = [];

    constructor(private IngresoService: IngresoService) {}

    ngOnInit(): void {
      this.obtenerIngresos();
    }

    obtenerIngresos(): void {
      this.IngresoService.obtenerIngresos().subscribe(response => {
        if (response && response.data) {
          this.ingresos = response.data;
          this.calcularTotal();
        }
      });
    }

    calcularTotal(): void {
      this.total = this.ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.monto), 0);
    }

    deleteIngreso(id: number): void {
      this.IngresoService.eliminarIngreso(id).subscribe(() => {
        this.ingresos = this.ingresos.filter(ingreso => ingreso.id !== id);
        this.calcularTotal();
      });
    }
  }
