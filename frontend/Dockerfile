
#Es la receta de la imagen del frontend. Primero usa Node para instalar dependencias
#y compilar Angular. Luego copia los archivos generados a Nginx

FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY angular.json tsconfig*.json ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser/ /usr/share/nginx/html/
EXPOSE 80

#Por eso, durante la demo con Docker ya puedes abrir la aplicación sin ejecutar ng serve