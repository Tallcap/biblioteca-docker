export interface Libro {
  id?: number;
  titulo: string;
  autor: string;
  isbn: string | null;
  genero: string;
  anioPublicacion: number | null;
  disponible: boolean;
}
