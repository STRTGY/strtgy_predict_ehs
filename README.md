# STRTGY Predict | Framework de Análisis Geoespacial B2B

Framework de análisis geoespacial y comercial interactivo para optimizar estrategias de distribución y expansión comercial B2B. Construido con [Observable Framework](https://observablehq.com/framework/) para crear reportes reproducibles con visualizaciones dinámicas, mapas interactivos y análisis de datos georreferenciados.

## ✨ Características Principales

- 📊 **Análisis de mercado:** Identificación y priorización de clientes potenciales
- 🗺️ **Mapas interactivos:** Visualización de datos geoespaciales con Leaflet
- 📈 **Scoring multicriterio:** Modelos personalizables de evaluación y priorización
- 🎯 **Análisis de ubicación:** Evaluación de puntos óptimos para centros de distribución
- 📦 **Análisis logístico:** Optimización de rutas y cobertura de mercado
- 💼 **Dashboard interactivo:** Filtros dinámicos y exportación de datos

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
strtgy_predict/
├── src/
│   ├── components/
│   │   ├── ui.js                    # Componentes UI reutilizables (KPI, tabla, badge)
│   │   ├── brand.js                 # Componentes con identidad STRTGY
│   │   └── maps.js                  # Componentes de mapas
│   ├── data/
│   │   ├── loaders.js               # Loaders de datos con validación
│   │   ├── README.md                # Guía de datasets requeridos
│   │   └── [tus archivos de datos]  # GeoJSON, CSV, etc.
│   ├── index.md                     # Página de inicio
│   ├── contexto-objetivos.md        # Contexto del análisis
│   ├── datos-metodologia.md         # Metodología y fuentes
│   ├── exploracion-territorio.md    # Exploración geográfica
│   ├── ubicacion-cedis.md           # Evaluación de ubicaciones
│   ├── analisis-comercial.md        # Análisis de mercado
│   ├── scoring-priorizacion.md      # Modelo de scoring
│   ├── logistica-sonora.md          # Análisis logístico
│   ├── dashboard.md                 # Dashboard interactivo
│   └── custom-theme.css             # Estilos personalizados
├── observablehq.config.js           # Configuración del sitio
├── package.json
└── README.md
```

## 📊 Estructura de Datos

El framework espera archivos de datos en `src/data/`. Consulta `src/data/README.md` para especificaciones detalladas.

### Tipos de datos soportados

| Tipo | Descripción | Formato |
|------|-------------|---------|
| **Geográficos** | Polígonos, puntos, líneas | GeoJSON FeatureCollection |
| **Establecimientos** | Ubicaciones de negocios | GeoJSON o CSV con lat/lon |
| **Scoring** | Métricas de evaluación | CSV con id y scores |
| **Demográficos** | Datos poblacionales | CSV o GeoJSON con propiedades |
| **Isocronas** | Áreas de cobertura temporal | GeoJSON con propiedad de tiempo |
| **Grids** | Cuadrículas de análisis | GeoJSON con métricas por celda |

### Configuración de datos

El sistema de data loaders en `src/data/loaders.js` proporciona:

- ✅ Validación automática de estructura
- ✅ Manejo graceful de archivos faltantes
- ✅ Normalización de propiedades
- ✅ Mensajes de error descriptivos

**Nota**: Todos los datos sensibles deben mantenerse en repositorios privados. Este repositorio público contiene solo el framework y datos de ejemplo anonimizados.

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

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el repositorio
2. Crea un branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🏢 Sobre STRTGY

STRTGY es una consultora especializada en inteligencia artificial y análisis geoespacial para optimización de negocios. Este framework es parte de nuestro conjunto de herramientas open-source para análisis de mercado y logística.

## ⚠️ Nota Importante

Este es un **framework público** para análisis geoespacial. Los datos incluidos en este repositorio son ejemplos anonimizados para demostración. Para implementaciones con datos reales:

1. **No incluyas datos confidenciales** en repositorios públicos
2. Mantén datos sensibles en repositorios privados separados
3. Usa variables de entorno para credenciales de APIs
4. Consulta nuestra [Política de Datos](docs/data-policy.md) para mejores prácticas

---

**Powered by STRTGY Geointelligence Framework** | Última actualización: Noviembre 2025
