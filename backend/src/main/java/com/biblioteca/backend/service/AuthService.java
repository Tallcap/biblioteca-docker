package com.biblioteca.backend.service;

import com.biblioteca.backend.dto.LoginRequest;
import com.biblioteca.backend.dto.LoginResponse;
import com.biblioteca.backend.dto.RegisterRequest;
import com.biblioteca.backend.model.Usuario;
import com.biblioteca.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null ||
                request.getUsername().trim().isEmpty() || request.getPassword().trim().isEmpty()) {
            return new LoginResponse(false, "Debe ingresar tanto el usuario como la contraseña", null, null, null, null);
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(request.getUsername().trim());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getPassword().equals(request.getPassword())) {
                String tokenPayload = usuario.getUsername() + ":" + System.currentTimeMillis();
                String token = Base64.getEncoder().encodeToString(tokenPayload.getBytes());

                return new LoginResponse(
                        true,
                        "Inicio de sesion exitoso",
                        token,
                        usuario.getUsername(),
                        usuario.getNombreCompleto(),
                        usuario.getRol()
                );
            } else {
                return new LoginResponse(false, "Contraseña incorrecta. Por favor ingrese su contraseña real.", null, null, null, null);
            }
        }

        return new LoginResponse(false, "El usuario ingresado no existe en el sistema.", null, null, null, null);
    }

    public LoginResponse register(RegisterRequest request) {
        if (request.getNombreCompleto() == null || request.getNombreCompleto().trim().isEmpty()) {
            return new LoginResponse(false, "El nombre completo es obligatorio.", null, null, null, null);
        }

        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return new LoginResponse(false, "El nombre de usuario es obligatorio.", null, null, null, null);
        }

        if (request.getPassword() == null || request.getPassword().length() < 4) {
            return new LoginResponse(false, "La contraseña debe tener al menos 4 caracteres.", null, null, null, null);
        }

        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            return new LoginResponse(false, "Las contraseñas no coinciden. Por favor confirme su contraseña real.", null, null, null, null);
        }

        String usernameLimpio = request.getUsername().trim().toLowerCase();

        if (usuarioRepository.findByUsername(usernameLimpio).isPresent()) {
            return new LoginResponse(false, "El nombre de usuario '" + usernameLimpio + "' ya está registrado.", null, null, null, null);
        }

        Usuario nuevoUsuario = new Usuario(
                usernameLimpio,
                request.getPassword(),
                request.getNombreCompleto().trim(),
                "BIBLIOTECARIO"
        );

        usuarioRepository.save(nuevoUsuario);

        String tokenPayload = nuevoUsuario.getUsername() + ":" + System.currentTimeMillis();
        String token = Base64.getEncoder().encodeToString(tokenPayload.getBytes());

        return new LoginResponse(
                true,
                "Usuario registrado exitosamente",
                token,
                nuevoUsuario.getUsername(),
                nuevoUsuario.getNombreCompleto(),
                nuevoUsuario.getRol()
        );
    }
}
