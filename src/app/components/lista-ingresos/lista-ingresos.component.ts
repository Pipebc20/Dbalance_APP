import { Component, OnInit } from '@angular/core';
import { IngresoService } from '../../services/ingreso.service';
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

  constructor(
    private ingresoService: IngresoService,
    private translate: TranslateService,
    private dialog: MatDialog // Inyecta MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerIngresos();
  }

  obtenerIngresos(): void {
    this.ingresoService.obtenerIngresos().subscribe(
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
