export interface Gasto {
  id?: number;
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string | Date;
}

export interface Ingreso {
  id?: number;
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string | Date;
  // Añade cualquier otro campo que pueda estar devolviendo tu API
}

// Interface más flexible para la respuesta del API
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;         // Para APIs que usan 'data'
  result?: T;       // Para APIs que usan 'result'
  item?: T;         // Para APIs que usan 'item'
  [key: string]: any; // Permite propiedades adicionales
  message?: string;
}
