#!/usr/bin/env python3
"""
Round-trip parity validation (MIT Wu 2014 thesis implementation)
Validates IFC -> CityGML -> IFC semantic preservation
"""
import sys, glob
from pathlib import Path
import ifcopenshell
from lxml import etree
from typing import Dict, List, Tuple, Optional
import logging
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CityGML namespaces
CITYGML_NS = "http://www.opengis.net/citygml/2.0"
GML_NS = "http://www.opengis.net/gml"

@dataclass
class ParityResult:
    """Result of round-trip parity validation"""
    ifc_file: str
    citygml_file: str
    buildings_parity: bool
    storeys_parity: bool
    properties_parity: bool
    ifc_buildings: int
    citygml_buildings: int
    ifc_storeys: int
    citygml_storeys: int
    errors: List[str]
    warnings: List[str]

class RoundTripValidator:
    """Round-trip validator following MIT Wu thesis workflow"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
    
    def count_ifc_buildings(self, ifc_path: Path) -> Tuple[int, List[Dict]]:
        """Count buildings in IFC file and extract metadata"""
        try:
            ifc_model = ifcopenshell.open(str(ifc_path))
            buildings = ifc_model.by_type("IfcBuilding")
            
            building_metadata = []
            for building in buildings:
                metadata = {
                    "name": building.Name or f"Building_{building.id()}",
                    "global_id": building.GlobalId,
                    "description": building.Description or "",
                    "object_type": building.ObjectType or ""
                }
                building_metadata.append(metadata)
            
            return len(buildings), building_metadata
            
        except Exception as e:
            self.errors.append(f"Error reading IFC file {ifc_path}: {str(e)}")
            return 0, []
    
    def count_ifc_storeys(self, ifc_path: Path) -> Tuple[int, List[Dict]]:
        """Count building storeys in IFC file and extract metadata"""
        try:
            ifc_model = ifcopenshell.open(str(ifc_path))
            storeys = ifc_model.by_type("IfcBuildingStorey")
            
            storey_metadata = []
            for storey in storeys:
                metadata = {
                    "name": storey.Name or f"Storey_{storey.id()}",
                    "elevation": getattr(storey, "Elevation", 0.0),
                    "global_id": storey.GlobalId,
                    "description": storey.Description or ""
                }
                storey_metadata.append(metadata)
            
            return len(storeys), storey_metadata
            
        except Exception as e:
            self.errors.append(f"Error reading IFC storeys {ifc_path}: {str(e)}")
            return 0, []
    
    def count_citygml_buildings(self, citygml_path: Path) -> Tuple[int, List[Dict]]:
        """Count buildings in CityGML file and extract metadata"""
        try:
            doc = etree.parse(str(citygml_path))
            
            # Count buildings using XPath
            buildings = doc.xpath("//c:Building", namespaces={"c": CITYGML_NS})
            
            building_metadata = []
            for building in buildings:
                # Extract building name
                name_elements = building.xpath(".//gml:name", namespaces={"gml": GML_NS})
                name = name_elements[0].text if name_elements else "Unknown"
                
                # Extract generic attributes
                attributes = {}
                attr_elements = building.xpath(".//c:genericAttribute", namespaces={"c": CITYGML_NS})
                for attr in attr_elements:
                    attr_name = attr.get("name")
                    attr_value = attr.get("value")
                    if attr_name:
                        attributes[attr_name] = attr_value
                
                metadata = {
                    "name": name,
                    "attributes": attributes
                }
                building_metadata.append(metadata)
            
            return len(buildings), building_metadata
            
        except Exception as e:
            self.errors.append(f"Error reading CityGML file {citygml_path}: {str(e)}")
            return 0, []
    
    def count_citygml_storeys(self, citygml_path: Path) -> Tuple[int, List[Dict]]:
        """Count storeys in CityGML file and extract metadata"""
        try:
            doc = etree.parse(str(citygml_path))
            
            # Count storeys by looking for storey names
            storey_names = doc.xpath("//gml:name[starts-with(text(), 'Storey::')]", 
                                   namespaces={"gml": GML_NS})
            
            storey_metadata = []
            for name_elem in storey_names:
                storey_name = name_elem.text.replace("Storey::", "")
                
                # Find elevation attribute
                elevation = None
                elevation_attrs = doc.xpath(f"//c:genericAttribute[@name='storey_elevation']", 
                                          namespaces={"c": CITYGML_NS})
                if elevation_attrs:
                    elevation = float(elevation_attrs[0].get("value", "0"))
                
                metadata = {
                    "name": storey_name,
                    "elevation": elevation or 0.0
                }
                storey_metadata.append(metadata)
            
            return len(storey_names), storey_metadata
            
        except Exception as e:
            self.errors.append(f"Error reading CityGML storeys {citygml_path}: {str(e)}")
            return 0, []
    
    def validate_parity(self, ifc_path: Path, citygml_path: Path) -> ParityResult:
        """Validate round-trip parity between IFC and CityGML files"""
        self.errors = []
        self.warnings = []
        
        ifc_buildings, ifc_building_metadata = self.count_ifc_buildings(ifc_path)
        ifc_storeys, ifc_storey_metadata = self.count_ifc_storeys(ifc_path)
        
        citygml_buildings, citygml_building_metadata = self.count_citygml_buildings(citygml_path)
        citygml_storeys, citygml_storey_metadata = self.count_citygml_storeys(citygml_path)
        
        # Validate building parity
        buildings_parity = ifc_buildings == citygml_buildings
        if not buildings_parity:
            self.errors.append(f"Building count mismatch: IFC={ifc_buildings}, CityGML={citygml_buildings}")
        
        # Validate storeys parity
        storeys_parity = ifc_storeys == citygml_storeys
        if not storeys_parity:
            self.errors.append(f"Storeys count mismatch: IFC={ifc_storeys}, CityGML={citygml_storeys}")
        
        # Validate properties parity
        properties_parity = True
        if ifc_buildings > 0 and citygml_buildings > 0:
            # Check if building names are preserved
            ifc_names = [b["name"] for b in ifc_building_metadata]
            citygml_names = [b["name"] for b in citygml_building_metadata]
            
            if set(ifc_names) != set(citygml_names):
                properties_parity = False
                self.errors.append("Building names not preserved in CityGML")
        
        # Add warnings for missing data
        if ifc_buildings == 0:
            self.warnings.append("No buildings found in IFC file")
        if citygml_buildings == 0:
            self.warnings.append("No buildings found in CityGML file")
        
        return ParityResult(
            ifc_file=str(ifc_path),
            citygml_file=str(citygml_path),
            buildings_parity=buildings_parity,
            storeys_parity=storeys_parity,
            properties_parity=properties_parity,
            ifc_buildings=ifc_buildings,
            citygml_buildings=citygml_buildings,
            ifc_storeys=ifc_storeys,
            citygml_storeys=citygml_storeys,
            errors=self.errors,
            warnings=self.warnings
        )

def main():
    """Main validation function"""
    if len(sys.argv) < 3:
        print("Usage: validate_roundtrip.py <ifc_directory> <citygml_directory>")
        print("Example: validate_roundtrip.py models/incoming models/outgoing")
        sys.exit(2)
    
    ifc_dir = Path(sys.argv[1])
    citygml_dir = Path(sys.argv[2])
    
    # Validate directories
    if not ifc_dir.exists():
        print(f"Error: IFC directory {ifc_dir} does not exist")
        sys.exit(1)
    
    if not citygml_dir.exists():
        print(f"Error: CityGML directory {citygml_dir} does not exist")
        sys.exit(1)
    
    # Initialize validator
    validator = RoundTripValidator()
    
    # Find IFC files
    ifc_files = list(ifc_dir.glob("*.ifc"))
    if not ifc_files:
        print(f"No IFC files found in {ifc_dir}")
        sys.exit(1)
    
    print(f"Found {len(ifc_files)} IFC files to validate")
    
    successful_validations = 0
    total_errors = 0
    
    for ifc_file in ifc_files:
        citygml_file = citygml_dir / (ifc_file.stem + ".gml")
        
        print(f"\nValidating: {ifc_file.name} <-> {citygml_file.name}")
        
        if not citygml_file.exists():
            print(f"❌ Missing CityGML file: {citygml_file}")
            total_errors += 1
            continue
        
        result = validator.validate_parity(ifc_file, citygml_file)
        
        if result.errors:
            print(f"❌ Validation failed: {len(result.errors)} errors")
            for error in result.errors:
                print(f"  - {error}")
            total_errors += len(result.errors)
        else:
            print(f"✅ Validation passed")
            successful_validations += 1
        
        if result.warnings:
            print(f"⚠️  Warnings: {len(result.warnings)}")
            for warning in result.warnings:
                print(f"  - {warning}")
        
        # Print parity details
        print(f"  Buildings: IFC={result.ifc_buildings}, CityGML={result.citygml_buildings}")
        print(f"  Storeys: IFC={result.ifc_storeys}, CityGML={result.citygml_storeys}")
    
    # Summary
    print(f"\n=== Validation Summary ===")
    print(f"Files validated: {len(ifc_files)}")
    print(f"Successful validations: {successful_validations}")
    print(f"Total errors: {total_errors}")
    
    if successful_validations == len(ifc_files):
        print("✅ All validations passed - semantic parity preserved")
        sys.exit(0)
    else:
        print(f"❌ {len(ifc_files) - successful_validations} validations failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
