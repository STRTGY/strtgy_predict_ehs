# Scripts de Generación de Datos

Este directorio contiene scripts para generar y procesar los archivos de datos optimizados para Observable Framework.

## Scripts Disponibles

### `generate_grid_suitability_web.py`

**Propósito:** Genera el archivo `src/data/grid_suitability.web.geojson` con todas las propiedades necesarias para la visualización del análisis de idoneidad de ubicación de centro de distribución.

**Fuente:** `data/processed/hermosillo_distribucion_grid_suitability_v2.geojson`

**Propiedades Generadas:**
- `suitability_score`: Score de idoneidad general (0-100)
- `customers_5km`: Clientes en radio de 5km
- `customers_10km`: Clientes en radio de 10km  
- `customers_15km`: Clientes en radio de 15km
- `coverage_ratio`: Ratio de cobertura de clientes
- `score_proximity`: Score de proximidad
- `score_coverage`: Score de cobertura
- `score_infrastructure`: Score de infraestructura
- `score_demographics`: Score demográfico
- `score_operational`: Score operacional
- `center_lat`, `center_lon`: Coordenadas del centro de la celda
- `row`, `col`: Posición en la grilla
- `in_city`: Indicador si está dentro de la ciudad

**Uso:**
```bash
cd reports/strtgy_predict_midmen_electrolit_hermosillo
python scripts/generate_grid_suitability_web.py
```

**Salida:**
- Archivo: `src/data/grid_suitability.web.geojson`
- Tamaño: ~736 KB
- Features: 1,170 celdas de grilla de 500m x 500m

**Validación:**
El script incluye validación automática de:
- ✓ Presencia de todas las propiedades requeridas
- ✓ Tipos de datos correctos
- ✓ Valores numéricos redondeados apropiadamente
- ✓ Verificación del archivo generado

## Flujo de Datos

```
data/processed/hermosillo_distribucion_grid_suitability_v2.geojson
    ↓
[generate_grid_suitability_web.py]
    ↓
src/data/grid_suitability.web.geojson
    ↓
[grid_suitability.web.geojson.js loader]
    ↓
Observable Framework visualizations
```

## Agregar Nuevos Scripts

Al crear un nuevo script de generación de datos:

1. **Nombre:** Use el formato `generate_[nombre]_web.py`
2. **Documentación:** Incluya docstring completo con propósito, fuente y uso
3. **Validación:** Implemente validación de datos de entrada y salida
4. **Logging:** Use print statements descriptivos con emojis para claridad
5. **Error Handling:** Maneje errores con mensajes claros
6. **Actualice este README:** Documente el nuevo script

## Ejemplo de Template para Nuevos Scripts

```python
#!/usr/bin/env python3
"""
Generate [nombre]_web.geojson for Observable Framework
=====================================================

[Descripción del propósito]

Source: [ruta del archivo fuente]
Output: src/data/[nombre]_web.geojson

Properties included:
- [lista de propiedades]

Usage:
    python scripts/generate_[nombre]_web.py
"""

import sys
from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
REPORT_ROOT = Path(__file__).parent.parent

def load_source_data():
    """Load source data"""
    # Implementación
    pass

def validate_properties(data):
    """Validate required properties"""
    # Implementación
    pass

def generate_web_geojson(source_data):
    """Generate web-optimized GeoJSON"""
    # Implementación
    pass

def save_output(data):
    """Save to output file"""
    # Implementación
    pass

def main():
    """Main execution"""
    print("="*70)
    print(f"  [NOMBRE DEL SCRIPT]")
    print("="*70)
    
    try:
        source_data = load_source_data()
        web_data = generate_web_geojson(source_data)
        output_path = save_output(web_data)
        print("\n✅ SUCCESS!")
        return 0
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
```

## Notas Importantes

1. **No modifique archivos fuente:** Los scripts deben leer de `data/processed/` sin modificar
2. **Salida en src/data/:** Todos los archivos web deben ir en `src/data/`
3. **Encoding UTF-8:** Siempre use `encoding='utf-8'` al leer/escribir archivos
4. **Validación:** Valide que las propiedades existen antes de generar
5. **Documentación:** Mantenga este README actualizado

## Solución de Problemas

### Error: Source file not found
- Verifique que el archivo fuente existe en `data/processed/`
- Revise la ruta relativa desde el script

### Error: Missing required properties
- Verifique que el archivo fuente contiene todas las propiedades
- Actualice el análisis fuente si faltan datos

### Error: Permission denied
- Verifique permisos de escritura en `src/data/`
- Cierre archivos abiertos en otros programas

## Mantenimiento

Estos scripts deben ejecutarse:
- ✓ Después de actualizar datos fuente en `data/processed/`
- ✓ Antes de hacer build de Observable Framework
- ✓ Al agregar nuevas propiedades a visualizaciones

Última actualización: 2025-11-08

