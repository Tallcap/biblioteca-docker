package com.biblioteca.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BibliotecaApplicationTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void contextLoads() {
    }

    @Test
    void rechazaUnLibroSinTitulo() throws Exception {
        mvc.perform(post("/api/libros").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"titulo":null,"autor":"Autora","genero":"Novela","anioPublicacion":2000,"disponible":true}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void rechazaUnaActualizacionConAnioNulo() throws Exception {
        mvc.perform(put("/api/libros/1").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"titulo":"Novela","autor":"Autora","genero":"Novela","anioPublicacion":null,"disponible":false}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void admiteIsbnNuloYDisponibilidadFalsa() throws Exception {
        mvc.perform(post("/api/libros").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"titulo":"  Novela  ","autor":"Autora","isbn":null,"genero":"Novela","anioPublicacion":2000,"disponible":false}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Novela"))
                .andExpect(jsonPath("$.disponible").value(false));
    }

}
