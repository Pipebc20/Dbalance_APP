import { Component, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core'; // Importar TranslateService

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    public translate: TranslateService // Inyectar TranslateService
  ) {}

  ngAfterViewInit() {
    // Añadir la clase 'animate' al ícono para la animación de achicamiento
    const icon = document.querySelector('.warning-icon');
    if (icon) {
      setTimeout(() => {
        icon.classList.add('animate');
      }, 100);
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
