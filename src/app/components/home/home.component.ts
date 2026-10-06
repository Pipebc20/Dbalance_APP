import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { IngresoService } from '../../services/ingreso.service';
import { GastoService } from '../../services/gasto.service';
import { PresupuestoService, Presupuesto } from '../../services/presupuesto.service';
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
  balance = 0;

  // Filtro de mes y año
  mesSeleccionado: number | null = null;
  anioSeleccionado: number | null = null;
  meses: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  anios: number[] = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Aviso de presupuestos superados (siempre del mes en curso)
  presupuestosExcedidos: Presupuesto[] = [];

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
    private presupuestoService: PresupuestoService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
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
          this.obtenerPresupuestosExcedidos();
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
    this.ingresoService.obtenerIngresos({
      mes: this.mesSeleccionado ?? undefined,
      anio: this.anioSeleccionado ?? undefined
    }).subscribe({
      next: response => {
        this.ingresos = Array.isArray(response.data) ? response.data : [];
        this.totalIngreso = this.ingresos.reduce((sum, ingreso) => sum + Number(ingreso.monto), 0);
        this.calcularBalance();
        this.actualizarGraficoIngresos();
      },
      error: err => console.error('Error fetching ingresos:', err)
    });
  }

  obtenerGastos(): void {
    this.gastoService.obtenerGastos({
      mes: this.mesSeleccionado ?? undefined,
      anio: this.anioSeleccionado ?? undefined
    }).subscribe({
      next: response => {
        this.gastos = Array.isArray(response.data) ? response.data : [];
        this.totalGasto = this.gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);
        this.calcularBalance();
        this.actualizarGraficoGastos();
      },
      error: err => console.error('Error fetching gastos:', err)
    });
  }

  obtenerPresupuestosExcedidos(): void {
    const hoy = new Date();
    this.presupuestoService.obtenerPresupuestos(hoy.getMonth() + 1, hoy.getFullYear()).subscribe({
      next: response => {
        this.presupuestosExcedidos = (response.data || []).filter(p => (p.gastado ?? 0) > p.monto_limite);
      },
      error: err => console.error('Error fetching presupuestos:', err)
    });
  }

  calcularBalance(): void {
    this.balance = this.totalIngreso - this.totalGasto;
  }

  nombreMes(mes: number): string {
    return new Date(2000, mes - 1, 1).toLocaleString(this.translate.currentLang || 'es', { month: 'long' });
  }

  onMesChange(valor: string): void {
    this.mesSeleccionado = valor ? Number(valor) : null;
    this.recargar();
  }

  onAnioChange(valor: string): void {
    this.anioSeleccionado = valor ? Number(valor) : null;
    this.recargar();
  }

  limpiarFiltro(): void {
    this.mesSeleccionado = null;
    this.anioSeleccionado = null;
    this.recargar();
  }

  private recargar(): void {
    this.obtenerIngresos();
    this.obtenerGastos();
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
