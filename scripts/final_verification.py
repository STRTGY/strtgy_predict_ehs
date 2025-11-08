#!/usr/bin/env python3
"""Final comprehensive verification of grid suitability data"""

import json
from pathlib import Path

REPORT_ROOT = Path(__file__).parent.parent

# Load web file
web_path = REPORT_ROOT / 'src' / 'data' / 'grid_suitability.web.geojson'

print('='*70)
print('  VERIFICACION FINAL COMPLETA - GRID SUITABILITY WEB')
print('='*70)
print()

with open(web_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'Archivo: {web_path.name}')
print(f'Tipo: {data["type"]}')
print(f'Nombre: {data["name"]}')
print(f'Total features: {len(data["features"])}')
print()

# Check all features have properties
features_with_props = sum(1 for f in data['features'] if f['properties'])
print(f'Features con propiedades: {features_with_props}/{len(data["features"])}')

# Check first feature
first_props = data['features'][0]['properties']
print(f'Propiedades por feature: {len(first_props)}')
print()

print('Lista de propiedades:')
for key in sorted(first_props.keys()):
    value = first_props[key]
    if isinstance(value, float):
        print(f'  {key}: {value:.2f}')
    else:
        print(f'  {key}: {value}')
print()

# Critical properties check
critical = ['suitability_score', 'customers_5km', 'customers_10km', 'center_lat', 'center_lon']
print('Propiedades criticas:')
all_present = True
for prop in critical:
    present = prop in first_props
    status = 'SI' if present else 'NO'
    print(f'  {prop:25} {status}')
    if not present:
        all_present = False
print()

# Statistics
if all_present:
    scores = [f['properties']['suitability_score'] for f in data['features']]
    cust_5km = [f['properties']['customers_5km'] for f in data['features']]
    cust_10km = [f['properties']['customers_10km'] for f in data['features']]
    
    print('Estadisticas:')
    print(f'  Suitability Score:')
    print(f'    Min: {min(scores):.2f}')
    print(f'    Max: {max(scores):.2f}')
    print(f'    Promedio: {sum(scores)/len(scores):.2f}')
    print(f'  Customers 5km:')
    print(f'    Total: {sum(cust_5km):,}')
    print(f'    Max por celda: {max(cust_5km)}')
    print(f'  Customers 10km:')
    print(f'    Total: {sum(cust_10km):,}')
    print(f'    Max por celda: {max(cust_10km)}')
    print()

# File size
file_size = web_path.stat().st_size
print(f'Tamano archivo: {file_size:,} bytes ({file_size/1024:.1f} KB)')
print()

# Final status
print('='*70)
if all_present and features_with_props == len(data['features']):
    print('  ✅ TODAS LAS VERIFICACIONES PASADAS')
    print('  Archivo listo para uso en Observable Framework')
else:
    print('  ❌ VERIFICACIONES FALLIDAS')
    print('  Regenerar archivo con: python scripts/generate_grid_suitability_web.py')
print('='*70)

