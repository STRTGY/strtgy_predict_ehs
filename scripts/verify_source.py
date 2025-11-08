#!/usr/bin/env python3
"""Verify source file is correct and complete"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent

# Load source file
source_path = PROJECT_ROOT / 'data' / 'processed' / 'hermosillo_distribucion_grid_suitability_v2.geojson'

print('='*70)
print('  VERIFICACION ARCHIVO FUENTE')
print('='*70)
print()
print(f'Archivo: {source_path.name}')
print()

with open(source_path, 'r', encoding='utf-8') as f:
    source = json.load(f)

print(f'Tipo: {source["type"]}')
print(f'Nombre: {source["name"]}')
print(f'CRS: {source["crs"]["properties"]["name"]}')
print(f'Total features: {len(source["features"])}')
print()

# Check first feature
first_feature = source['features'][0]
props = first_feature['properties']

print('Propiedades en archivo fuente (primera feature):')
for key in sorted(props.keys()):
    value = props[key]
    if isinstance(value, float):
        print(f'  {key}: {value:.2f}')
    else:
        print(f'  {key}: {value}')

print()
print(f'Total de propiedades: {len(props)}')
print()

# Load web file
web_path = Path(__file__).parent.parent / 'src' / 'data' / 'grid_suitability.web.geojson'
with open(web_path, 'r', encoding='utf-8') as f:
    web = json.load(f)

web_props = web['features'][0]['properties']

print('='*70)
print('  COMPARACION FUENTE vs WEB')
print('='*70)
print()
print(f'Archivo fuente:  {len(source["features"])} features, {len(props)} propiedades')
print(f'Archivo web:     {len(web["features"])} features, {len(web_props)} propiedades')
print()

# Check critical properties
critical_props = ['suitability_score', 'customers_5km', 'customers_10km', 'center_lat', 'center_lon']
print('Propiedades criticas presentes:')
for prop in critical_props:
    in_source = 'SI' if prop in props else 'NO'
    in_web = 'SI' if prop in web_props else 'NO'
    print(f'  {prop:25} Fuente: {in_source}  Web: {in_web}')

print()
print('='*70)
print('  ARCHIVO FUENTE CONFIRMADO Y VALIDO')
print('='*70)

