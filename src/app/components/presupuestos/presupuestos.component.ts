import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import Toastify from 'toastify-js';
import { PresupuestoService, Presupuesto } from '../../services/presupuesto.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-presupuestos',
  templateUrl: './presupuestos.component.html',
  styleUrls: ['./presupuestos.component.scss']
})
export class PresupuestosComponent implements OnInit {
  presupuestos: Presupuesto[] = [];
  categorias: string[] = [];

  mes: number = new Date().getMonth() + 1;
  anio: number = new Date().getFullYear();
  meses: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  anios: number[] = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  editandoId: number | null = null;
  categoria = '';
  montoLimite: number | null = null;

  constructor(
    private presupuestoService: PresupuestoService,
    private translate: TranslateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.cargarCategorias();
  }

  get formularioValido(): boolean {
    return !!this.categoria.trim() && this.montoLimite !== null && this.montoLimite > 0;
  }

  cargar(): void {
    this.presupuestoService.obtenerPresupuestos(this.mes, this.anio).subscribe(
      (response) => {
        this.presupuestos = response?.data ?? [];
      },
      (error) => {
        console.error('Error al obtener los presupuestos:', error);
        this.showErrorToast('BUDGET_FETCH_ERROR');
      }
    );
  }

  cargarCategorias(): void {
    this.presupuestoService.obtenerCategorias().subscribe(
      (response) => { this.categorias = response?.data ?? []; },
      (error) => console.error('Error al obtener las categorías:', error)
    );
  }

  nombreMes(mes: number): string {
    return new Date(2000, mes - 1, 1).toLocaleString(this.translate.currentLang || 'es', { month: 'long' });
  }

  onMesChange(valor: string): void {
    this.mes = Number(valor);
    this.cargar();
  }

  onAnioChange(valor: string): void {
    this.anio = Number(valor);
    this.cargar();
  }

  guardar(): void {
    if (!this.formularioValido) return;

    const payload: Presupuesto = {
      categoria: this.categoria.trim(),
      monto_limite: Number(this.montoLimite)
    };

    const peticion = this.editandoId
      ? this.presupuestoService.actualizarPresupuesto(this.editandoId, payload)
      : this.presupuestoService.guardarPresupuesto(payload);

    const exito = this.editandoId ? 'BUDGET_UPDATED_SUCCESS' : 'BUDGET_SAVED_SUCCESS';

    peticion.subscribe(
      () => {
        this.showSuccessToast(exito);
        this.cancelarEdicion();
        this.cargar();
      },
      (error) => {
        console.error('Error al guardar el presupuesto:', error);
        this.showErrorToast(error.status === 422 ? 'BUDGET_INVALID' : 'BUDGET_SAVE_ERROR');
      }
    );
  }

  editar(p: Presupuesto): void {
    this.editandoId = p.id ?? null;
    this.categoria = p.categoria;
    this.montoLimite = p.monto_limite;
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.categoria = '';
    this.montoLimite = null;
  }

  eliminar(p: Presupuesto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: this.translate.instant('CONFIRM_DELETE_BUDGET') }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && p.id) {
        this.presupuestoService.eliminarPresupuesto(p.id).subscribe(
          () => {
            this.showSuccessToast('BUDGET_DELETED_SUCCESS');
            this.cargar();
          },
          (error) => {
            console.error('Error al eliminar el presupuesto:', error);
            this.showErrorToast('BUDGET_DELETE_ERROR');
          }
        );
      }
    });
  }

  excedido(p: Presupuesto): number {
    return (p.gastado ?? 0) - p.monto_limite;
  }

  anchoBarra(p: Presupuesto): number {
    return Math.min(p.porcentaje ?? 0, 100);
  }

  claseBarra(p: Presupuesto): string {
    const porcentaje = p.porcentaje ?? 0;
    if (porcentaje > 100) return 'bg-danger';
    if (porcentaje >= 80) return 'bg-warning';
    return 'bg-success';
  }

  private showSuccessToast(message: string): void {
    Toastify({
      text: this.translate.instant(message),
      close: true,
      gravity: "bottom",
      position: "center",
      stopOnFocus: true,
      style: { background: "#189586" }
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
