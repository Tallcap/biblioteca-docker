import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });

  it('muestra el error de login cuando responde la API', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/login');
    await fixture.whenStable();
    const vista: HTMLElement = fixture.nativeElement;
    for (const [name, value] of [['username', 'usuario'], ['password', 'incorrecta']]) {
      const control = vista.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
      control.value = value;
      control.dispatchEvent(new Event('input'));
    }
    vista.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    const boton = vista.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(boton.disabled).toBe(true);

    TestBed.inject(HttpTestingController).expectOne('http://127.0.0.1:8080/api/auth/login')
      .flush({ message: 'Contraseña incorrecta.' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(vista.querySelector('[role="alert"]')?.textContent).toContain('Contraseña incorrecta.');
    expect(boton.disabled).toBe(false);
  });

  it('muestra el catálogo al recibir los libros y permite buscar con ISBN nulo', async () => {
    localStorage.setItem('token', 'sesion-de-prueba');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/libros');
    await fixture.whenStable();
    const vista: HTMLElement = fixture.nativeElement;
    expect(vista.textContent).toContain('cargando libros');

    TestBed.inject(HttpTestingController).expectOne('http://127.0.0.1:8080/api/libros')
      .flush([{
        id: 1, titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry',
        isbn: null, genero: 'Fábula', anioPublicacion: 1943, disponible: true
      }]);
    await fixture.whenStable();

    expect(vista.textContent).not.toContain('cargando libros');
    expect(vista.querySelector('tbody')?.textContent).toContain('El Principito');
    const buscador = vista.querySelector<HTMLInputElement>('input[type="text"]')!;
    buscador.value = 'fábula';
    buscador.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(vista.querySelector('tbody')?.textContent).toContain('El Principito');
  });

  it('actualiza el estado con un clic al prestar y devolver un libro', async () => {
    localStorage.setItem('token', 'sesion-de-prueba');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/libros');
    const vista: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);
    const url = 'http://127.0.0.1:8080/api/libros';
    const libro = {
      id: 1, titulo: 'El Principito', autor: 'Antoine',
      isbn: null, genero: 'Novela', anioPublicacion: 1943, disponible: true
    };
    await fixture.whenStable();
    http.expectOne(url).flush([libro]);
    await fixture.whenStable();

    for (const disponible of [false, true]) {
      const accion = disponible ? 'Marcar como disponible' : 'Marcar como prestado';
      const boton = vista.querySelector<HTMLButtonElement>(`button[aria-label="${accion}"]`)!;
      boton.click();
      const peticion = http.expectOne({ method: 'PUT', url: url + '/1' });
      expect(peticion.request.body.disponible).toBe(disponible);
      await fixture.whenStable();
      expect(boton.disabled).toBe(true);
      peticion.flush({ ...libro, disponible });
      await fixture.whenStable();
      expect(vista.querySelector('tbody')?.textContent).toContain(disponible ? 'Disponible' : 'Prestado');
      expect(vista.querySelector(`button[aria-label="${accion}"]`)).toBeNull();
    }
  });
});
