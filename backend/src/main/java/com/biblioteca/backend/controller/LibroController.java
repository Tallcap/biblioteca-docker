package com.biblioteca.backend.controller;

import com.biblioteca.backend.model.Libro;
import com.biblioteca.backend.service.LibroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Year;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LibroController {

    private final LibroService libroService;

    public LibroController(LibroService libroService) {
        this.libroService = libroService;
    }

    // Listar todos los libros
    @GetMapping
    public List<Libro> listarTodos() {
        return libroService.listarTodos();
    }

    // Obtener un libro por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Libro> obtenerPorId(@PathVariable Long id) {
        return libroService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Buscar libros por titulo o autor
    @GetMapping("/buscar")
    public List<Libro> buscar(@RequestParam(required = false, defaultValue = "") String filtro) {
        return libroService.buscarPorFiltro(filtro);
    }

    // Crear un nuevo libro
    @PostMapping
    public ResponseEntity<Libro> crear(@RequestBody Libro libro) {
        validarLibro(libro);
        libro.setId(null);
        Libro nuevo = libroService.guardar(libro);
        return new ResponseEntity<>(nuevo, HttpStatus.CREATED);
    }

    // Actualizar un libro existente
    @PutMapping("/{id}")
    public ResponseEntity<Libro> actualizar(@PathVariable Long id, @RequestBody Libro libro) {
        validarLibro(libro);
        return libroService.actualizar(id, libro)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private void validarLibro(Libro libro) {
        validarTextoObligatorio(libro.getTitulo(), "El título");
        validarTextoObligatorio(libro.getAutor(), "El autor");
        validarTextoObligatorio(libro.getGenero(), "El género");
        if (libro.getIsbn() != null && libro.getIsbn().strip().length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ISBN admite hasta 255 caracteres.");
        }
        int anioActual = Year.now().getValue();
        Integer anio = libro.getAnioPublicacion();
        if (anio == null || anio < 1 || anio > anioActual) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El año de publicación debe estar entre 1 y " + anioActual + ".");
        }
        if (libro.getDisponible() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indica si el libro está disponible.");
        }

        libro.setTitulo(libro.getTitulo().strip());
        libro.setAutor(libro.getAutor().strip());
        libro.setGenero(libro.getGenero().strip());
        if (libro.getIsbn() != null) {
            libro.setIsbn(libro.getIsbn().strip());
        }
    }

    private void validarTextoObligatorio(String valor, String campo) {
        if (valor == null || valor.isBlank() || valor.strip().length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    campo + " es obligatorio y admite hasta 255 caracteres.");
        }
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> responderErrorDeValidacion(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(Map.of("message", error.getReason()));
    }

    // Eliminar un libro
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (libroService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
