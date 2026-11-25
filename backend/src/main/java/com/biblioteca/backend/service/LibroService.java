package com.biblioteca.backend.service;

import com.biblioteca.backend.model.Libro;
import com.biblioteca.backend.repository.LibroRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LibroService {

    private final LibroRepository libroRepository;

    public LibroService(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    public List<Libro> listarTodos() {
        return libroRepository.findAll();
    }

    public Optional<Libro> obtenerPorId(Long id) {
        return libroRepository.findById(id);
    }

    public List<Libro> buscarPorFiltro(String filtro) {
        if (filtro == null || filtro.trim().isEmpty()) {
            return libroRepository.findAll();
        }
        return libroRepository.findByTituloContainingIgnoreCaseOrAutorContainingIgnoreCase(filtro, filtro);
    }

    public Libro guardar(Libro libro) {
        return libroRepository.save(libro);
    }

    public Optional<Libro> actualizar(Long id, Libro libroActualizado) {
        return libroRepository.findById(id).map(libroExistente -> {
            libroExistente.setTitulo(libroActualizado.getTitulo());
            libroExistente.setAutor(libroActualizado.getAutor());
            libroExistente.setIsbn(libroActualizado.getIsbn());
            libroExistente.setGenero(libroActualizado.getGenero());
            libroExistente.setAnioPublicacion(libroActualizado.getAnioPublicacion());
            libroExistente.setDisponible(libroActualizado.getDisponible());
            return libroRepository.save(libroExistente);
        });
    }

    public boolean eliminar(Long id) {
        if (libroRepository.existsById(id)) {
            libroRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
