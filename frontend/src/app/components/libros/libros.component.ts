import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { LibroService } from '../../services/libro.service';
import { AuthService } from '../../services/auth.service';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-libros',
  imports: [CommonModule, FormsModule],
  templateUrl: './libros.component.html',
  styleUrl: './libros.component.css'
})
export class LibrosComponent implements OnInit {
  private libroService = inject(LibroService);
  private changeDetector = inject(ChangeDetectorRef);
  readonly anioActual = new Date().getFullYear();
  readonly generos = ['Novela', 'Ficción', 'Tecnología', 'Historia', 'Filosofía', 'Ciencia', 'Clásico', 'Infantil', 'Otro'];
  authService = inject(AuthService);

  libros: Libro[] = [];
  librosFiltrados: Libro[] = [];
  cargando = true;
  readonly cambiandoDisponibilidad = new Set<number>();
  filtroTexto = '';
  filtroEstado: 'todos' | 'disponibles' | 'prestados' = 'todos';

  // Control de alertas
  mensajeExito = '';
  mensajeError = '';

  // Control del modal / formulario
  mostrarModal = false;
  errorFormulario = '';
  guardando = false;
  modoEdicion = false;
  libroSeleccionado: Libro = this.crearLibroVacio();

  // Control del modal de eliminación
  mostrarModalEliminar = false;
  libroAEliminar: Libro | null = null;

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.libroService.getLibros().pipe(finalize(() => {
      this.cargando = false;
      this.changeDetector.markForCheck();
    })).subscribe({
      next: (data) => {
        this.libros = data;
        this.aplicarFiltros();
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar la lista de libros desde el backend.';
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.libros];

    // Filtro por texto (título, autor o ISBN)
    if (this.filtroTexto.trim()) {
      const q = this.filtroTexto.toLowerCase().trim();
      resultado = resultado.filter(l =>
        l.titulo?.toLowerCase().includes(q) ||
        l.autor?.toLowerCase().includes(q) ||
        l.isbn?.toLowerCase().includes(q) ||
        l.genero?.toLowerCase().includes(q)
      );
    }

    // Filtro por disponibilidad
    if (this.filtroEstado === 'disponibles') {
      resultado = resultado.filter(l => l.disponible);
    } else if (this.filtroEstado === 'prestados') {
      resultado = resultado.filter(l => !l.disponible);
    }

    this.librosFiltrados = resultado;
  }

  cambiarFiltroEstado(estado: 'todos' | 'disponibles' | 'prestados'): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  limpiarBusqueda(): void {
    this.filtroTexto = '';
    this.aplicarFiltros();
  }

  // Abrir modal para crear
  abrirModalCrear(): void {
    this.errorFormulario = '';
    this.modoEdicion = false;
    this.libroSeleccionado = this.crearLibroVacio();
    this.mostrarModal = true;
  }

  // Abrir modal para editar
  abrirModalEditar(libro: Libro): void {
    this.errorFormulario = '';
    this.modoEdicion = true;
    this.libroSeleccionado = { ...libro };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  // Guardar (Crear o Editar)
  guardarLibro(): void {
    if (this.guardando) return;
    const libro = this.libroSeleccionado;
    if (!libro.titulo?.trim() || !libro.autor?.trim() || !libro.genero?.trim()) {
      this.errorFormulario = 'Completa el título, el autor y el género.';
      return;
    }
    const anio = libro.anioPublicacion;
    if (anio === null || !Number.isInteger(anio) || anio < 1 || anio > this.anioActual) {
      this.errorFormulario = `Ingresa un año entero entre 1 y ${this.anioActual}.`;
      return;
    }

    this.errorFormulario = '';
    this.guardando = true;
    const id = this.modoEdicion ? libro.id : undefined;
    const solicitud = id === undefined
      ? this.libroService.crearLibro(libro)
      : this.libroService.actualizarLibro(id, libro);

    solicitud.pipe(finalize(() => {
      this.guardando = false;
      this.changeDetector.markForCheck();
    })).subscribe({
      next: (guardado) => {
        this.libros = id === undefined
          ? [...this.libros, guardado]
          : this.libros.map(actual => actual.id === id ? guardado : actual);
        this.aplicarFiltros();
        this.mostrarAlertaExito(id === undefined ? 'Libro agregado al catálogo.' : 'Libro actualizado.');
        this.cerrarModal();
      },
      error: (err) => {
        this.errorFormulario = err.error?.message || 'No se pudo guardar el libro.';
      }
    });
  }

  // Alternar disponibilidad rápida
  toggleDisponibilidad(libro: Libro): void {
    const id = libro.id;
    if (id === undefined || this.cambiandoDisponibilidad.has(id)) return;

    this.cambiandoDisponibilidad.add(id);
    this.mensajeError = '';
    const copia = { ...libro, disponible: !libro.disponible };
    this.libroService.actualizarLibro(id, copia).pipe(finalize(() => {
      this.cambiandoDisponibilidad.delete(id);
      this.changeDetector.markForCheck();
    })).subscribe({
      next: (actualizado) => {
        this.libros = this.libros.map(actual =>
          actual.id === id ? { ...actualizado, id } : actual
        );
        this.mostrarAlertaExito(
          `Libro marcado como ${actualizado.disponible ? 'Disponible' : 'Prestado'}`
        );
        this.aplicarFiltros();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'No se pudo cambiar la disponibilidad.';
      }
    });
  }

  // Confirmar eliminación
  abrirConfirmarEliminar(libro: Libro): void {
    this.libroAEliminar = libro;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.libroAEliminar = null;
  }

  confirmarEliminar(): void {
    const id = this.libroAEliminar?.id;
    if (id === undefined) return;

    this.libroService.eliminarLibro(id).pipe(
      finalize(() => this.changeDetector.markForCheck())
    ).subscribe({
      next: () => {
        this.mostrarAlertaExito('Libro eliminado del catálogo.');
        this.libros = this.libros.filter(libro => libro.id !== id);
        this.aplicarFiltros();
        this.cerrarModalEliminar();
      },
      error: () => {
        this.mensajeError = 'No se pudo eliminar el libro.';
        this.cerrarModalEliminar();
      }
    });
  }

  private mostrarAlertaExito(msg: string): void {
    this.mensajeExito = msg;
    this.mensajeError = '';
    setTimeout(() => {
      this.mensajeExito = '';
      this.changeDetector.markForCheck();
    }, 4000);
  }

  private crearLibroVacio(): Libro {
    return {
      titulo: '',
      autor: '',
      isbn: '',
      genero: 'Novela',
      anioPublicacion: this.anioActual,
      disponible: true
    };
  }
}
