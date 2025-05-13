import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { IngresoService } from '../../services/ingreso.service';
import { GastoService } from '../../services/gasto.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  ingresos: any[] = [];
  gastos: any[] = [];
  totalGasto = 0;
  totalIngreso = 0;

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  public ingresosChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  public gastosChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  public chartType: ChartType = 'pie';

  constructor(
    private ingresoService: IngresoService,
    private gastoService: GastoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      console.error('User not authenticated. Redirecting to login.');
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getUser().subscribe({
      next: user => {
        if (user && user.id) {
          this.obtenerIngresos();
          this.obtenerGastos();
        } else {
          console.error('No user data found. Logging out and redirecting to login.');
          this.authService.logout().subscribe(() => {
            this.router.navigate(['/login']);
          });
        }
      },
      error: err => {
        console.error('Error fetching user data:', err);
        this.authService.logout().subscribe(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  obtenerIngresos(): void {
    this.ingresoService.obtenerIngresos().subscribe({
      next: response => {
        this.ingresos = Array.isArray(response.data) ? response.data : [];
        this.totalIngreso = this.ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
        this.actualizarGraficoIngresos();
      },
      error: err => console.error('Error fetching ingresos:', err)
    });
  }

  obtenerGastos(): void {
    this.gastoService.obtenerGastos().subscribe({
      next: response => {
        this.gastos = Array.isArray(response.data) ? response.data : [];
        this.totalGasto = this.gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
        this.actualizarGraficoGastos();
      },
      error: err => console.error('Error fetching gastos:', err)
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
