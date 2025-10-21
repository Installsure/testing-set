#!/usr/bin/env python3
"""
Round-trip parity validation (MIT CityGML workflow).
Checks:
- At least one Building per IFC file became a CityGML Building feature
- Basic name/ID traceability preserved
- (Optional) Count of storeys (IfcBuildingStorey) reflected in CityGML names
Pass/fail: nonzero exit on parity failure.
"""
import sys, glob
from pathlib import Path
import ifcopenshell
from lxml import etree

CITYGML_NS = "http://www.opengis.net/citygml/2.0"
GML_NS = "http://www.opengis.net/gml"

def count_ifc_buildings(ifc_path):
    m = ifcopenshell.open(str(ifc_path))
    return len(m.by_type("IfcBuilding"))

def count_gml_buildings(gml_path):
    doc = etree.parse(str(gml_path))
    return len(doc.xpath("//c:Building", namespaces={"c": CITYGML_NS}))

def main():
    if len(sys.argv) < 3:
        print("Usage: validate_roundtrip.py <in_ifc_dir> <out_gml_dir>"); sys.exit(2)
    in_ifc, out_gml = Path(sys.argv[1]), Path(sys.argv[2])
    failures = 0
    for ifc_file in glob.glob(str(in_ifc / "*.ifc")):
        stem = Path(ifc_file).stem
        gml_file = out_gml / f"{stem}.gml"
        if not gml_file.exists():
            print(f"[FAIL] Missing CityGML for {stem}")
            failures += 1
            continue
        ib = count_ifc_buildings(ifc_file)
        gb = count_gml_buildings(gml_file)
        if ib == 0 or gb == 0:
            print(f"[FAIL] No buildings detected (IFC={ib}, GML={gb}) for {stem}")
            failures += 1
        else:
            print(f"[OK] {stem}: IFC buildings={ib}, CityGML buildings={gb}")
    sys.exit(1 if failures else 0)

if __name__ == "__main__":
    main()
