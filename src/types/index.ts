export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: string;
  categoria: string;
  stock: number;
  estado: 'activo' | 'inactivo';
  fecha_registro: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  password?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardData {
  total_usuarios: number;
  usuarios_activos: number;
  total_productos: number;
  productos_activos: number;
  productos_stock_bajo: number;
  valor_inventario: string;
}

export interface ReporteCategoria {
  categoria: string;
  total: number;
  valor_inventario: string;
  stock_total: number;
}

export interface ReporteEstado {
  estado: string;
  total: number;
}

export interface ReporteData {
  por_categoria: ReporteCategoria[];
  por_estado: ReporteEstado[];
  stock_bajo: number;
  total_productos: number;
  valor_total_inventario: string;
}
