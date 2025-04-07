import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { IngresoService } from '../../services/ingreso.service';
import { GastoService } from '../../services/gasto.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  ingresos: any[] = [];
  gastos: any[] = [];
  totalGasto = 0;
  totalIngreso = 0;

  public chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  public ingresosChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  public gastosChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  public chartType: ChartType = 'pie';

  constructor(private ingresoService: IngresoService, private gastoService: GastoService) {}

  ngOnInit(): void {
    this.obtenerIngresos();
    this.obtenerGastos();
  }

  obtenerIngresos(): void {
    this.ingresoService.obtenerIngresos().subscribe(data => {
      this.ingresos = Array.isArray(data) ? data : [];
      this.totalIngreso = this.ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
      this.actualizarGraficoIngresos();
    });
  }

  obtenerGastos(): void {
    this.gastoService.obtenerGastos().subscribe(data => {
      this.gastos = Array.isArray(data) ? data : [];
      this.totalGasto = this.gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
      this.actualizarGraficoGastos();
    });
  }

  actualizarGraficoIngresos(): void {
    this.ingresosChartData = {
      labels: this.ingresos.map(ingreso => ingreso.categoria),
      datasets: [
        {
          data: this.ingresos.map(ingreso => ingreso.monto),
          backgroundColor: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF5722'],
        }
      ]
    };
  }

  actualizarGraficoGastos(): void {
    this.gastosChartData = {
      labels: this.gastos.map(gasto => gasto.categoria),
      datasets: [
        {
          data: this.gastos.map(gasto => gasto.monto),
          backgroundColor: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
        }
      ]
    };
  }
}
