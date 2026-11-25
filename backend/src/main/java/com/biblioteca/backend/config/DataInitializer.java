package com.biblioteca.backend.config;

import com.biblioteca.backend.model.Libro;
import com.biblioteca.backend.model.Usuario;
import com.biblioteca.backend.repository.LibroRepository;
import com.biblioteca.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;

    public DataInitializer(LibroRepository libroRepository, UsuarioRepository usuarioRepository) {
        this.libroRepository = libroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) {
        // Cargar usuarios por defecto
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(new Usuario("admin", "admin123", "Administrador Principal", "ADMIN"));
            usuarioRepository.save(new Usuario("bibliotecario", "123456", "Juan Perez", "BIBLIOTECARIO"));
        }

        // Cargar libros de prueba
        if (libroRepository.count() == 0) {
            libroRepository.save(new Libro("Cien Años de Soledad", "Gabriel Garcia Marquez", "978-0307474728", "Novela / Realismo Magico", 1967, true));
            libroRepository.save(new Libro("Don Quijote de la Mancha", "Miguel de Cervantes", "978-8424116286", "Clasico / Literatura", 1605, true));
            libroRepository.save(new Libro("El Principito", "Antoine de Saint-Exupery", "978-0156013987", "Fabula / Filosofia", 1943, true));
            libroRepository.save(new Libro("Clean Code: A Handbook of Agile Software", "Robert C. Martin", "978-0132350884", "Tecnologia / Ingenieria", 2008, false));
            libroRepository.save(new Libro("Ficciones", "Jorge Luis Borges", "978-0307950925", "Cuentos / Ficcion", 1944, true));
            libroRepository.save(new Libro("El Alquimista", "Paulo Coelho", "978-0062502179", "Autoayuda / Aventura", 1988, true));
        }
    }
}
