# STRTGY Predict | Distribución de Electrolit en Hermosillo, Sonora

Análisis geoespacial y comercial interactivo para optimizar la distribución B2B de Electrolit en Hermosillo y Sonora. Este proyecto utiliza [Observable Framework](https://observablehq.com/framework/) para crear reportes reproducibles con visualizaciones dinámicas, mapas interactivos y capacidades de exportación.

## 🚀 Inicio rápido

### Requisitos previos

- Node.js 18 o superior
- npm o yarn

### Instalación

```bash
# Clonar o navegar al directorio del proyecto
cd reports/strtgy_predict_midmen_electrolit_hermosillo

# Instalar dependencias
npm install
```

### Desarrollo local

```bash
# Iniciar servidor de desarrollo (abre automáticamente en navegador)
npm run dev

# O iniciar sin abrir navegador
npm run preview
```

El sitio estará disponible en <http://localhost:3000>

## 📁 Estructura del proyecto

```
reports/strtgy_predict_midmen_electrolit_hermosillo/
├── src/
│   ├── components/
│   │   └── ui.js                    # Componentes UI reutilizables (KPI, tabla, badge, etc.)
│   ├── data/
│   │   ├── loaders.js               # Loaders de datos con validación
│   │   ├── README.md                # Guía de datasets requeridos
│   │   ├── hermosillo_ageb.geojson  # Polígonos AGEB (colocar aquí)
│   │   ├── denue_hermosillo.geojson # Establecimientos DENUE (colocar aquí)
│   │   ├── scores_ageb.csv          # Scoring por AGEB (colocar aquí)
│   │   ├── priorizados.csv          # Lista priorizada (colocar aquí)
│   │   ├── isocronas_5_10.geojson   # Isocronas 5/10 min (colocar aquí) ✨ NUEVO
│   │   ├── cuadricula_500m.geojson  # Grid 500m (colocar aquí) ✨ NUEVO
│   │   ├── competencia.geojson      # Competencia (colocar aquí) ✨ NUEVO
│   │   └── zonas_interes.geojson    # Zonas de interés (colocar aquí) ✨ NUEVO
│   ├── index.md                     # Página de inicio
│   ├── contexto-objetivos.md        # Contexto del proyecto
│   ├── datos-metodologia.md         # Metodología y fuentes
│   ├── exploracion-territorio.md    # Mapas base y exploración (mejorado)
│   ├── ubicacion-cedis.md           # Evaluación ubicación CEDIS ✨ NUEVO
│   ├── analisis-comercial.md        # Análisis comercial por SCIAN (mejorado)
│   ├── scoring-priorizacion.md      # Modelo de scoring (mejorado)
│   ├── logistica-sonora.md          # Análisis logístico
│   ├── dashboard.md                 # Dashboard interactivo (mejorado)
│   ├── anexos.md                    # Anexos y diccionario
│   └── custom-theme.css             # Estilos personalizados (mejorado)
├── observablehq.config.js           # Configuración del sitio
├── package.json
└── README.md
```

## 📊 Datos requeridos

Para que el sitio funcione completamente, coloca los siguientes archivos en `src/data/`:

### Archivos principales

| Archivo | Descripción | Formato |
|---------|-------------|---------|
| `hermosillo_ageb.geojson` | Polígonos de AGEBs urbanas de Hermosillo | GeoJSON FeatureCollection |
| `denue_hermosillo.geojson` | Establecimientos DENUE georreferenciados | GeoJSON FeatureCollection |
| `scores_ageb.csv` | Scoring calculado por AGEB | CSV con columnas: `ageb`, `score`, variables... |
| `priorizados.csv` | Lista priorizada de establecimientos | CSV con columnas: `id`, `nombre`, `scian`, `score`, `direccion`, `ageb`... |

### Archivos nuevos (análisis ampliado)

| Archivo | Descripción | Formato |
|---------|-------------|---------|
| `isocronas_5_10.geojson` | Polígonos isocronas 5 y 10 min | GeoJSON con propiedad `minutos: 5\|10` |
| `cuadricula_500m.geojson` | Grid 500m con métricas | GeoJSON con `dens_comercial`, `pob18`, `score_grid` |
| `competencia.geojson` | Puntos competencia (Abarrey, Balgo) | GeoJSON con `nombre`, `segmento` |
| `zonas_interes.geojson` | Zonas de abastos, corredores | GeoJSON con `nombre` |

### Archivos opcionales

- `sonora_municipios.geojson` - Límites municipales de Sonora
- `demografia_hermosillo.csv` - Datos demográficos agregados
- `logistica_analisis.json` - Resultados de análisis logístico

**Ver `src/data/README.md` para instrucciones detalladas de cada archivo.**

**Nota**: Todos los loaders son "graceful" - si un archivo no está disponible, el sitio mostrará un mensaje informativo sin fallar.

## 🛠️ Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor de desarrollo (con auto-open) |
| `npm run preview` | Servidor de desarrollo (sin auto-open) |
| `npm run build` | Construir sitio estático en `dist/` |
| `npm run clean` | Limpiar cache y archivos build |
| `npm run deploy` | Desplegar a Observable Cloud |

## 🚢 Despliegue

### Opción 1: Observable Cloud

```bash
# Desplegar directamente a Observable
npm run deploy
```

Sigue las instrucciones en pantalla para autenticarte y seleccionar workspace.

### Opción 2: Hosting estático (Netlify, Vercel, GitHub Pages)

```bash
# 1. Construir el sitio
npm run build

# 2. El contenido estático estará en dist/
# Subir la carpeta dist/ a tu servicio de hosting preferido
```

#### Netlify

1. Conecta tu repositorio
2. Configuración de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

#### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

Configuración en `vercel.json` (opcional):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

#### GitHub Pages

```bash
# En package.json, agregar:
"scripts": {
  "deploy:gh": "npm run build && gh-pages -d dist"
}

# Instalar gh-pages
npm install --save-dev gh-pages

# Desplegar
npm run deploy:gh
```

### Opción 3: Servidor propio

El contenido en `dist/` es HTML/CSS/JS estático. Puede servirse con:

```bash
# Usando un servidor simple
npx serve dist

# O con nginx, Apache, etc.
```

## 🎨 Personalización

### Tema y estilos

Edita `src/custom-theme.css` para ajustar colores, tipografía y estilos:

```css
:root {
  --strtgy-blue: #0066cc;
  --strtgy-green: #00a651;
  --strtgy-orange: #ff6b35;
}
```

### Configuración del sitio

Edita `observablehq.config.js` para cambiar:

- Título y descripción
- Estructura de navegación
- Meta tags de SEO
- Tema base (air, light, dark, etc.)
- Analytics (Google Tag Manager)

### Componentes reutilizables

Los componentes en `src/components/ui.js` pueden extenderse:

```javascript
// Agregar nuevo componente
export function myComponent(data) {
  // Tu código aquí
  return element;
}
```

## 📖 Uso del sitio

### Dashboard interactivo

1. Navega a `/dashboard`
2. Usa los filtros para:
   - Score mínimo (slider)
   - Patrón SCIAN (regex)
   - Zona geográfica
   - Límite de resultados
3. Ordena tabla haciendo clic en columnas
4. Exporta resultados con botón "Exportar CSV"

### Mapas

Los mapas se cargan bajo demanda (lazy load) para optimizar performance. Haz clic en "Cargar mapa" cuando lo necesites.

## 🔍 Solución de problemas

### Los datos no aparecen

- Verifica que los archivos estén en `src/data/`
- Comprueba formato de archivos (GeoJSON válido, CSV con headers)
- Revisa consola del navegador para errores

### El sitio no construye

```bash
# Limpiar cache y reinstalar
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Errores de memoria en build

```bash
# Aumentar límite de memoria de Node
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## 📚 Recursos

- [Observable Framework Documentation](https://observablehq.com/framework/)
- [Observable Plot](https://observablehq.com/plot/) - Librería de visualización
- [Leaflet](https://leafletjs.com/) - Mapas interactivos
- [D3](https://d3js.org/) - Manipulación de datos

## 🤝 Contribuciones

Este es un proyecto interno de STRTGY. Para cambios:

1. Crear branch desde `main`
2. Hacer cambios y probar localmente
3. Crear Pull Request con descripción clara

## 📄 Licencia

Uso interno - STRTGY © 2025

---

**Desarrollado por STRTGY para Electrolit** | Última actualización: Octubre 2025
