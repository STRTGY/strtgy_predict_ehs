#!/usr/bin/env python3
"""
Generate grid_suitability.web.geojson for Observable Framework
==============================================================

Processes the distribution center suitability grid analysis and creates
a web-optimized GeoJSON file with all required properties for visualization.

Source: data/processed/hermosillo_distribucion_grid_suitability_v2.geojson
Output: src/data/grid_suitability.web.geojson

Properties included:
- suitability_score: Overall suitability score (0-100)
- customers_5km, customers_10km, customers_15km: Customer coverage by radius
- center_lat, center_lon: Grid cell center coordinates
- score_proximity, score_coverage, score_infrastructure: Component scores
- score_demographics, score_operational: Additional scoring dimensions

Usage:
    python scripts/generate_grid_suitability_web.py
"""

import sys
from pathlib import Path
import json

# Project root
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
REPORT_ROOT = Path(__file__).parent.parent

def load_source_data():
    """Load source grid suitability data"""
    source_path = PROJECT_ROOT / 'data' / 'processed' / 'hermosillo_distribucion_grid_suitability_v2.geojson'
    
    if not source_path.exists():
        print(f"❌ ERROR: Source file not found: {source_path}")
        sys.exit(1)
    
    print(f"📂 Loading source: {source_path}")
    
    with open(source_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✓ Loaded {len(data['features'])} features")
    return data


def validate_properties(data):
    """Validate that all features have required properties"""
    required_props = [
        'suitability_score',
        'customers_5km',
        'customers_10km', 
        'customers_15km',
        'center_lat',
        'center_lon'
    ]
    
    print("\n🔍 Validating properties...")
    
    if not data['features']:
        print("❌ ERROR: No features found")
        return False
    
    # Check first feature
    first_feature = data['features'][0]
    props = first_feature.get('properties', {})
    
    missing = [prop for prop in required_props if prop not in props]
    
    if missing:
        print(f"❌ ERROR: Missing required properties: {missing}")
        return False
    
    print(f"✓ All {len(required_props)} required properties present")
    print(f"✓ Total properties per feature: {len(props)}")
    
    # Show sample values
    print(f"\n📊 Sample values from first feature:")
    for prop in required_props:
        print(f"  {prop}: {props[prop]}")
    
    return True


def clean_properties(data):
    """Clean and normalize properties for web display"""
    print("\n🧹 Cleaning properties...")
    
    cleaned_features = []
    
    for feature in data['features']:
        props = feature['properties']
        
        # Keep all properties but ensure numeric types are proper
        cleaned_props = {
            'suitability_score': round(float(props['suitability_score']), 2),
            'customers_5km': int(props['customers_5km']),
            'customers_10km': int(props['customers_10km']),
            'customers_15km': int(props['customers_15km']),
            'coverage_ratio': round(float(props.get('coverage_ratio', 0)), 4),
            'score_proximity': round(float(props.get('score_proximity', 0)), 2),
            'score_coverage': round(float(props.get('score_coverage', 0)), 2),
            'score_infrastructure': round(float(props.get('score_infrastructure', 0)), 2),
            'score_demographics': round(float(props.get('score_demographics', 0)), 2),
            'score_operational': round(float(props.get('score_operational', 0)), 2),
            'center_lat': round(float(props['center_lat']), 6),
            'center_lon': round(float(props['center_lon']), 6),
            'row': int(props.get('row', 0)),
            'col': int(props.get('col', 0)),
            'in_city': bool(props.get('in_city', True))
        }
        
        cleaned_features.append({
            'type': 'Feature',
            'properties': cleaned_props,
            'geometry': feature['geometry']
        })
    
    print(f"✓ Cleaned {len(cleaned_features)} features")
    
    return cleaned_features


def generate_web_geojson(source_data):
    """Generate web-optimized GeoJSON"""
    print("\n🌐 Generating web GeoJSON...")
    
    # Validate first
    if not validate_properties(source_data):
        sys.exit(1)
    
    # Clean properties
    cleaned_features = clean_properties(source_data)
    
    # Create output structure
    output_data = {
        'type': 'FeatureCollection',
        'name': 'grid_suitability.web',
        'crs': source_data.get('crs'),
        'features': cleaned_features
    }
    
    return output_data


def save_output(data):
    """Save to output file"""
    output_path = REPORT_ROOT / 'src' / 'data' / 'grid_suitability.web.geojson'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"\n💾 Saving to: {output_path}")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=None)
    
    # Verify file size
    file_size = output_path.stat().st_size
    print(f"✓ File written: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    
    return output_path


def verify_output(output_path):
    """Verify the generated file"""
    print("\n✅ Verifying output...")
    
    with open(output_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✓ Features count: {len(data['features'])}")
    
    if data['features']:
        first_props = data['features'][0]['properties']
        print(f"✓ Properties per feature: {len(first_props)}")
        print(f"✓ Sample suitability_score: {first_props['suitability_score']}")
        print(f"✓ Sample customers_5km: {first_props['customers_5km']}")
    
    print("\n✅ SUCCESS! Grid suitability web file generated successfully.")


def main():
    """Main execution"""
    print("="*70)
    print("  GRID SUITABILITY WEB GEOJSON GENERATOR")
    print("="*70)
    
    try:
        # Load source
        source_data = load_source_data()
        
        # Generate web version
        web_data = generate_web_geojson(source_data)
        
        # Save
        output_path = save_output(web_data)
        
        # Verify
        verify_output(output_path)
        
        print("\n" + "="*70)
        print("  GENERATION COMPLETE")
        print("="*70)
        
        return 0
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())

