#!/usr/bin/env python3
"""
Update AGEB GeoJSON with scores and counts from establishments (point-in-polygon).

Reads AGEB polygons and establishment points, does a spatial join to count
establishments per AGEB, computes a 0-10 score from that count (percentile-based),
and optionally adds pob_total from POB* columns. Writes an updated GeoJSON and
optionally a shapefile.

Inputs (defaults):
  - agebs_base.web.geojson  (or --agebs)
  - establecimientos_scored.web.geojson  (or --establecimientos)

Output:
  - agebs_con_scores_establecimientos.web.geojson  (and optionally .shp with --shapefile)

Properties added per AGEB:
  - n_establecimientos: count of establishments inside the polygon
  - score_estab_0_10: score 1-10 from establishment count (percentile, higher count = higher score)
  - pob_total: sum of POB* columns (SCINCE), if present in source

Usage:
  python scripts/agebs_scores_from_establishments.py
  python scripts/agebs_scores_from_establishments.py --agebs src/data/agebs_base.web.geojson --establecimientos src/data/establecimientos_scored.web.geojson --out src/data/agebs_con_scores_establecimientos.web.geojson --shapefile
"""

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import geopandas as gpd
    from shapely.geometry import shape
except ImportError:
    print("geopandas and shapely are required. Install with: pip install geopandas shapely")
    sys.exit(1)

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def load_geojson(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_geojson(data: dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=None)


def sum_pob_feature(properties: dict) -> int:
    """Sum POB1, POB2, ... (exclude POB*_R) from SCINCE properties."""
    total = 0
    for k, v in properties.items():
        if re.match(r"^POB\d+$", k):
            try:
                total += max(0, int(v))
            except (TypeError, ValueError):
                pass
    return total


def run(
    agebs_path: Path,
    establecimientos_path: Path,
    out_path: Path,
    write_shapefile: bool = False,
) -> None:
    print("Loading AGEBs:", agebs_path)
    agebs_gdf = gpd.GeoDataFrame.from_file(agebs_path)
    if agebs_gdf.crs is None:
        agebs_gdf.set_crs(epsg=4326, inplace=True)
    else:
        agebs_gdf = agebs_gdf.to_crs(epsg=4326)

    print("Loading establishments:", establecimientos_path)
    estab_gdf = gpd.GeoDataFrame.from_file(establecimientos_path)
    if estab_gdf.crs is None:
        estab_gdf.set_crs(epsg=4326, inplace=True)
    else:
        estab_gdf = estab_gdf.to_crs(epsg=4326)

    cve_col = "CVEGEO" if "CVEGEO" in agebs_gdf.columns else "ageb"
    agebs_gdf["_idx"] = range(len(agebs_gdf))

    joined = gpd.sjoin(estab_gdf, agebs_gdf, how="inner", predicate="within")
    counts = joined.groupby("_idx").size().reindex(agebs_gdf["_idx"], fill_value=0).astype(int)

    agebs_gdf["n_establecimientos"] = agebs_gdf["_idx"].map(counts).fillna(0).astype(int)
    agebs_gdf.drop(columns=["_idx"], inplace=True)

    n_est = agebs_gdf["n_establecimientos"].values
    if n_est.max() > n_est.min():
        pct = (n_est - n_est.min()) / (n_est.max() - n_est.min())
        score = 1.0 + pct * 9.0
    else:
        score = 5.0
    agebs_gdf["score_estab_0_10"] = (score.round(2)).clip(1, 10)

    lookup = agebs_gdf.set_index(cve_col)[["n_establecimientos", "score_estab_0_10"]].to_dict("index")

    raw = load_geojson(agebs_path)
    for feat in raw["features"]:
        props = feat.setdefault("properties", {})
        cve = props.get("CVEGEO") or props.get("ageb")
        row = lookup.get(cve) if cve else None
        if row is not None:
            props["n_establecimientos"] = int(row["n_establecimientos"])
            props["score_estab_0_10"] = round(float(row["score_estab_0_10"]), 2)
        else:
            props["n_establecimientos"] = 0
            props["score_estab_0_10"] = 5.0
        props["pob_total"] = sum_pob_feature(props)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    save_geojson(raw, out_path)
    print("Wrote:", out_path)
    print("  n_establecimientos: min={}, max={}".format(
        agebs_gdf["n_establecimientos"].min(),
        agebs_gdf["n_establecimientos"].max(),
    ))
    print("  score_estab_0_10: min={}, max={}".format(
        agebs_gdf["score_estab_0_10"].min(),
        agebs_gdf["score_estab_0_10"].max(),
    ))

    if write_shapefile:
        shp_path = out_path.with_suffix("")
        pob_cols = [c for c in agebs_gdf.columns if re.match(r"^POB\d+$", c)]
        agebs_gdf["pob_total"] = agebs_gdf[pob_cols].fillna(0).astype(int).sum(axis=1) if pob_cols else 0
        agebs_gdf.to_file(shp_path, driver="ESRI Shapefile")
        print("Wrote shapefile:", str(shp_path) + ".shp")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Update AGEB GeoJSON with establishment counts and scores (point-in-polygon)."
    )
    parser.add_argument(
        "--agebs",
        type=Path,
        default=PROJECT_ROOT / "src" / "data" / "agebs_base.web.geojson",
        help="Path to AGEB GeoJSON",
    )
    parser.add_argument(
        "--establecimientos",
        type=Path,
        default=PROJECT_ROOT / "src" / "data" / "establecimientos_scored.web.geojson",
        help="Path to establishments GeoJSON (points)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=PROJECT_ROOT / "src" / "data" / "agebs_con_scores_establecimientos.web.geojson",
        help="Output GeoJSON path",
    )
    parser.add_argument(
        "--shapefile",
        action="store_true",
        help="Also write ESRI Shapefile (same base name as --out)",
    )
    args = parser.parse_args()

    if not args.agebs.exists():
        print("Error: AGEB file not found:", args.agebs)
        return 1
    if not args.establecimientos.exists():
        print("Error: Establishments file not found:", args.establecimientos)
        return 1

    run(
        agebs_path=args.agebs,
        establecimientos_path=args.establecimientos,
        out_path=args.out,
        write_shapefile=args.shapefile,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
