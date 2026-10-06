import { Component, OnInit } from '@angular/core';
import { IngresoService } from '../../services/ingreso.service';
import { ExportService } from '../../services/export.service';
import { TranslateService } from '@ngx-translate/core';
import Toastify from 'toastify-js';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'; // Ajusta la ruta

@Component({
  selector: 'app-lista-ingresos',
  templateUrl: './lista-ingresos.component.html',
  styleUrls: ['./lista-ingresos.component.scss']
})
export class ListaIngresosComponent implements OnInit {
  expenses: any[] = [];
  total: number = 0;
  ingresos: any[] = [];

  // Filtro de mes y año
  mesSeleccionado: number | null = null;
  anioSeleccionado: number | null = null;
  meses: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  anios: number[] = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  constructor(
    private ingresoService: IngresoService,
    private exportService: ExportService,
    private translate: TranslateService,
    private dialog: MatDialog // Inyecta MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerIngresos();
  }

  obtenerIngresos(): void {
    this.ingresoService.obtenerIngresos({
      mes: this.mesSeleccionado ?? undefined,
      anio: this.anioSeleccionado ?? undefined
    }).subscribe(
      (response) => {
        if (response && response.data) {
          this.ingresos = response.data;
          this.calcularTotal();
        }
      },
      (error) => {
        console.error('Error al obtener los ingresos:', error);
        this.showErrorToast('INCOME_FETCH_ERROR');
      }
    );
  }

  calcularTotal(): void {
    this.total = this.ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.monto), 0);
  }

  nombreMes(mes: number): string {
    return new Date(2000, mes - 1, 1).toLocaleString(this.translate.currentLang || 'es', { month: 'long' });
  }

  onMesChange(valor: string): void {
    this.mesSeleccionado = valor ? Number(valor) : null;
    this.obtenerIngresos();
  }

  onAnioChange(valor: string): void {
    this.anioSeleccionado = valor ? Number(valor) : null;
    this.obtenerIngresos();
  }

  limpiarFiltro(): void {
    this.mesSeleccionado = null;
    this.anioSeleccionado = null;
    this.obtenerIngresos();
  }

  async exportarExcel(): Promise<void> {
    if (!this.ingresos.length) {
      this.showErrorToast('NO_DATA_TO_SHOW');
      return;
    }

    try {
      await this.exportService.exportarExcel({
        nombreHoja: this.translate.instant('INCOME'),
        nombreTabla: 'TablaIngresos',
        archivo: this.nombreArchivo('ingresos'),
        tema: 'TableStyleMedium4',
        etiquetas: {
          categoria: this.translate.instant('CATEGORY'),
          monto: this.translate.instant('AMOUNT'),
          descripcion: this.translate.instant('DESCRIPTION_LABEL'),
          fecha: this.translate.instant('DATE'),
          total: this.translate.instant('TOTAL_INCOME')
        },
        filas: this.ingresos.map(i => ({
          categoria: i.categoria,
          monto: Number(i.monto),
          descripcion: i.descripcion,
          fecha: String(i.fecha ?? '').substring(0, 10)
        }))
      });
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    }
  }

  private nombreArchivo(base: string): string {
    const partes = [base];
    if (this.anioSeleccionado) partes.push(String(this.anioSeleccionado));
    if (this.mesSeleccionado) partes.push(String(this.mesSeleccionado).padStart(2, '0'));
    return partes.join('_') + '.xlsx';
  }

  deleteIngreso(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: this.translate.instant('CONFIRM_DELETE_INCOME') }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ingresoService.eliminarIngreso(id).subscribe(
          () => {
            this.ingresos = this.ingresos.filter(ingreso => ingreso.id !== id);
            this.calcularTotal();
            this.showSuccessToast('INCOME_DELETED_SUCCESS');
          },
          (error) => {
            console.error('Error al eliminar el ingreso:', error);
            this.showErrorToast('INCOME_DELETE_ERROR');
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
