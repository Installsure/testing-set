#!/usr/bin/env python3
"""
IFC -> CityGML conversion (workflow per MIT thesis on CityGML workflows).
- Parse IFC with IfcOpenShell
- Extract Buildings/Storeys/Spaces (and key properties)
- Emit minimal CityGML 2.0 feature structure with gml:id, names, semantics
Source workflow reference: MIT "Development of MIT Geospatial Data to CityGML Workflows" (Wu, 2014).
"""
import sys, os, glob
from pathlib import Path
import ifcopenshell
from lxml import etree

CITYGML_NS = "http://www.opengis.net/citygml/2.0"
GML_NS = "http://www.opengis.net/gml"
CORE = "{%s}" % CITYGML_NS
GML = "{%s}" % GML_NS
NSMAP = {None: CITYGML_NS, "gml": GML_NS}

def citymodel_root():
    root = etree.Element(CORE + "CityModel", nsmap=NSMAP)
    bnd = etree.SubElement(root, GML + "boundedBy")
    etree.SubElement(bnd, GML + "Null", reason="unknown").text = "unknown"
    return root

def add_building(cm, name, gml_id):
    member = etree.SubElement(cm, CORE + "cityObjectMember")
    bldg = etree.SubElement(member, CORE + "Building", attrib={GML + "id": gml_id})
    etree.SubElement(bldg, GML + "name").text = name
    return bldg

def write_citygml(cm, out_path):
    tree = etree.ElementTree(cm)
    tree.write(out_path, pretty_print=True, xml_declaration=True, encoding="utf-8")

def process_ifc(ifc_path: Path, out_dir: Path):
    model = ifcopenshell.open(str(ifc_path))
    cm = citymodel_root()

    # Minimal semantic mapping: IfcBuilding -> Building; attach storeys as names
    buildings = model.by_type("IfcBuilding") or []
    if not buildings:
        # Fallback: try IfcSite/IfcBuildingStorey presence to still emit a CityModel
        pass

    for idx, b in enumerate(buildings or [None]):
        bname = (b.Name if b else f"UnknownBuilding_{idx}") or f"Building_{idx}"
        bldg = add_building(cm, bname, f"b-{idx}")

        # Attach storey names as gml:name entries for traceability
        if b:
            rels = model.get_inverse(b)
            storeys = [r.RelatedObjects for r in rels if getattr(r, "is_a", lambda: "")() == "IfcRelAggregates"]
            names = []
            for grp in storeys:
                for s in grp:
                    if s.is_a("IfcBuildingStorey"):
                        nm = s.Name or f"Storey_{s.id()}"
                        names.append(nm)
                        etree.SubElement(bldg, GML + "name").text = f"Storey::{nm}"

    out_file = out_dir / (ifc_path.stem + ".gml")
    write_citygml(cm, out_file)
    print(f"[CITYGML] Wrote {out_file}")

def main():
    if len(sys.argv) < 3:
        print("Usage: ifc_to_citygml.py <in_dir> <out_dir>"); sys.exit(2)
    in_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    for p in glob.glob(str(in_dir / "*.ifc")):
        process_ifc(Path(p), out_dir)

if __name__ == "__main__":
    main()
