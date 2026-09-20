# Paso 1 - Estructura base del proyecto

**Fecha:** Dia 1
**Objetivo:** Separar el HTML monolitico en archivos independientes

## Que se hizo

- Se separo el archivo `prueba.html` (monolitico) en 3 archivos:
  - `index.html` - Estructura HTML del formulario
  - `css/styles.css` - Todos los estilos
  - `js/app.js` - Toda la logica JavaScript
- Se anadio el logo de Grupo Tragsa (`img/logo_cabecera.png`) en la cabecera
- Se crearon las pestanas para Desarenador A/B/C y Contenedor

## Archivos creados/modificados

- `index.html` (nuevo)
- `css/styles.css` (nuevo)
- `js/app.js` (nuevo)

## Alternativas consideradas

- **Usar un bundler (Webpack/Vite):** Descartado porque la app es local y no necesita build step
- **Usar un framework (React/Vue):** Descartado por ser innecesario para un formulario simple
- **Mantener todo en un solo archivo:** Descartado por mantenibilidad

## Notas

El archivo original `prueba.html` contenia HTML + CSS + JS todo junto. La separacion facilita el desarrollo y mantenimiento.
