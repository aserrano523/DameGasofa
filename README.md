# DameGasofa
## Gasolineras & Rutas

**Gasolineras y rutas inteligentes**

DameGasofa es una aplicación web desarrollada en React que permite localizar gasolineras cercanas, identificar la más barata según un radio y tipo de combustible, y planificar rutas mostrando estaciones de servicio a lo largo del trayecto. La aplicación integra APIs externas de geolocalización y cartografía, y presenta los resultados de forma visual e interactiva sobre un mapa.

## Funcionalidades principales

* **Ubicación de referencia**

  * Detección automática de la ubicación del usuario.
  * Introducción manual de coordenadas (latitud y longitud).

* **Gasolineras más cercanas**

  * Búsqueda de estaciones próximas a la ubicación.
  * Filtro por empresa.
  * Visualización en mapa y tarjetas informativas.

* **Gasolinera más barata**

  * Selección de radio de búsqueda y tipo de combustible.
  * Identificación de la estación más económica.
  * Marcadores diferenciados en el mapa (usuario vs gasolinera).

* **Planificación de rutas**

  * Cálculo de rutas entre origen y destino.
  * Definición de un corredor alrededor de la ruta.
  * Visualización de estaciones a lo largo del trayecto.
  * Resumen de distancia y duración estimada.

## Tecnologías utilizadas

* **Frontend**

  * React
  * Vite
  * JavaScript (ES6+)
  * CSS / PostCSS

* **APIs externas**

  * Mapbox (Mapas, Geocodificación y Rutas)
  * API pública de precios de carburantes (España)

* **Herramientas**

  * Git y GitHub
  * GitHub Pages (despliegue)

## Estructura del proyecto

```
src/
 ├─ components/        # Componentes React (Input, Output, Map, Panels)
 ├─ utils/             # Lógica de negocio (ranking, horarios, tiempos)
 ├─ services/          # Acceso a APIs externas
 ├─ styles/            # Estilos globales
 └─ App.jsx            # Componente principal
```

## Instalación y ejecución en local

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Despliegue

El proyecto está preparado para su despliegue en **GitHub Pages** mediante el proceso de build de Vite.

```bash
npm run build
npm run deploy
```

## Contexto académico

**Actividad 3: Uso de una API en aplicación de componentes**
Asignatura: *Desarrollo de Aplicaciones en Red*
Grado en Ingeniería Informática – Universidad Internacional de La Rioja (UNIR)

**Grupo Nº 2**

* Marta Álvarez Jaén
* Carlos García Acevedo
* Antonio Serrano Fernández

## Licencia

Proyecto desarrollado con fines académicos y docentes.
