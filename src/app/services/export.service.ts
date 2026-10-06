import { Injectable } from '@angular/core';

export interface FilaExport {
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string; // formato yyyy-MM-dd
}

export interface OpcionesExport {
  nombreHoja: string;
  nombreTabla: string; // sin espacios, empieza con letra
  archivo: string;
  tema: string; // por ejemplo 'TableStyleMedium7'
  etiquetas: {
    categoria: string;
    monto: string;
    descripcion: string;
    fecha: string;
    total: string;
  };
  filas: FilaExport[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  async exportarExcel(op: OpcionesExport): Promise<void> {
    // Se carga solo al hacer clic en exportar, para no engordar la app
    const modulo: any = await import('exceljs');
    const ExcelJS = modulo.default ?? modulo;

    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet(op.nombreHoja.substring(0, 31), {
      views: [{ state: 'frozen', ySplit: 1 }] // encabezado fijo al hacer scroll
    });

    // Tabla de Excel: filtros, orden, filas alternadas y fila de total
    hoja.addTable({
      name: op.nombreTabla,
      ref: 'A1',
      headerRow: true,
      totalsRow: true,
      style: { theme: op.tema, showRowStripes: true },
      columns: [
        { name: op.etiquetas.categoria, totalsRowLabel: op.etiquetas.total, filterButton: true },
        { name: op.etiquetas.monto, totalsRowFunction: 'sum', filterButton: true },
        { name: op.etiquetas.descripcion, filterButton: true },
        { name: op.etiquetas.fecha, filterButton: true }
      ],
      rows: op.filas.map(f => [f.categoria, f.monto, f.descripcion, this.aFecha(f.fecha)])
    });

    // Formato de moneda en el monto (incluida la fila de total)
    const filaTotal = op.filas.length + 2; // encabezado + filas + total
    for (let fila = 2; fila <= filaTotal; fila++) {
      hoja.getCell(fila, 2).numFmt = '"$"#,##0.00';
    }

    // Fecha real (se puede ordenar y filtrar por año o mes)
    for (let fila = 2; fila < filaTotal; fila++) {
      const celda = hoja.getCell(fila, 4);
      celda.numFmt = 'dd/mm/yyyy';
      celda.alignment = { horizontal: 'left' };
    }

    hoja.getColumn(1).width = 24;
    hoja.getColumn(2).width = 16;
    hoja.getColumn(3).width = 42;
    hoja.getColumn(4).width = 14;

    const buffer = await libro.xlsx.writeBuffer();
    this.descargar(buffer, op.archivo);
  }

  // Fecha en UTC para que el huso horario no la corra un día
  private aFecha(texto: string): Date | string {
    const [anio, mes, dia] = (texto || '').split('-').map(Number);
    if (!anio || !mes || !dia) {
      return texto;
    }
    return new Date(Date.UTC(anio, mes - 1, dia));
  }

  private descargar(buffer: ArrayBuffer, nombreArchivo: string): void {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }
}
