package com.biblioteca.backend.dto;

public class RegisterRequest {
    private String nombreCompleto;
    private String username;
    private String password;
    private String confirmPassword;

    public RegisterRequest() {
    }

    public RegisterRequest(String nombreCompleto, String username, String password, String confirmPassword) {
        this.nombreCompleto = nombreCompleto;
        this.username = username;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
