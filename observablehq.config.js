// See https://observablehq.com/framework/config for documentation.
export default {
  // The app's title; used in the sidebar and webpage titles.
  title: "STRTGY Predict | Distribución de Electrolit en Hermosillo, Sonora",
  
  // Base path for GitHub Pages deployment
  base: "/strtgy_ai_geointelligence/",
  
  // SEO and metadata
  description: "Análisis geoespacial y comercial para optimizar la distribución de Electrolit en Hermosillo y Sonora. Priorización de establecimientos B2B mediante scoring multi-criterio.",
  
  // Pages and sections in the sidebar
  pages: [
    { name: "Inicio", path: "/" },
    {
      name: "1) Contexto y Objetivos",
      path: "/contexto-objetivos"
    },
    {
      name: "2) Datos y Metodología",
      path: "/datos-metodologia"
    },
    {
      name: "3) Exploración Territorial",
      path: "/exploracion-territorio"
    },
    {
      name: "3a) Ubicación CEDIS",
      path: "/ubicacion-cedis"
    },
    {
      name: "4) Análisis Comercial",
      path: "/analisis-comercial"
    },
    {
      name: "5) Scoring y Priorización",
      path: "/scoring-priorizacion"
    },
    {
      name: "6) Logística y Sonora",
      path: "/logistica-sonora"
    },
    {
      name: "7) Dashboard Interactivo",
      path: "/dashboard"
    },
    {
      name: "Mapas Interactivos",
      open: true,
      pages: [
        { name: "🚚 Hubs Logísticos", path: "/mapas/hubs" },
        { name: "💰 Puntos de Venta", path: "/mapas/puntos-venta" },
        { name: "⭐ Sweet Spots", path: "/mapas/sweet-spots" }
      ]
    },
    {
      name: "Analítica Avanzada",
      pages: [
        { name: "📊 Competencia", path: "/analitica/competencia" }
      ]
    },
    { name: "📥 Descargas", path: "/descargas" },
    {
      name: "Anexos y Diccionario",
      path: "/anexos"
    }
  ],

  // Enhanced head with favicon, OG tags, Leaflet CSS and analytics
  head: `
    <link rel="icon" href="observable.png" type="image/png" sizes="32x32">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="anonymous">
    <meta property="og:title" content="STRTGY Predict | Electrolit Hermosillo">
    <meta property="og:description" content="Análisis geoespacial y comercial para distribución B2B de Electrolit en Hermosillo, Sonora">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="STRTGY Predict | Electrolit Hermosillo">
    <meta name="twitter:description" content="Análisis geoespacial para distribución B2B">
  `,

  // The path to the source root
  root: "src",

  // Theme and UI configuration
  theme: ["cotton", "wide"],  // Light theme for Observable Framework
  
  // Footer
  footer: "© 2025 STRTGY.ai",
  
  // Enable sidebar navigation
  sidebar: true,
  
  // Enable table of contents
  toc: {
    show: false,
    label: "En esta página"
  },
  
  // Enable pagination
  pager: true,
  
  // Enable search functionality
  search: true,
  
  // Enable automatic URL linking
  linkify: true,
  
  // Typographic improvements
  typographer: true,
  
  // Output configuration
  output: "dist",
  
  // Clean URLs (optional, uncomment if preferred)
  // preserveExtension: false,
  // preserveIndex: false,
  
  // Custom style overrides (commented to use default Observable theme)
  // style: "custom-theme.css"
};
