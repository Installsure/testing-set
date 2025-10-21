#!/usr/bin/env python3
"""
IFC -> CityGML conversion (MIT Wu 2014 thesis implementation)
Development of MIT Geospatial Data to CityGML Workflows
"""
import sys, os, glob
from pathlib import Path
import ifcopenshell
from lxml import etree
from typing import Dict, List, Optional, Tuple
import logging
from dataclasses import dataclass
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CityGML namespaces per MIT workflow
CITYGML_NS = "http://www.opengis.net/citygml/2.0"
GML_NS = "http://www.opengis.net/gml"
CORE = "{%s}" % CITYGML_NS
GML = "{%s}" % GML_NS
NSMAP = {None: CITYGML_NS, "gml": GML_NS}

@dataclass
class ConversionResult:
    """Result of IFC to CityGML conversion"""
    success: bool
    input_file: str
    output_file: str
    buildings_processed: int
    errors: List[str]
    warnings: List[str]

class IFCToCityGMLConverter:
    """IFC to CityGML converter following MIT Wu thesis workflow"""
    
    def __init__(self):
        self.buildings_processed = 0
        self.errors = []
        self.warnings = []
    
    def create_citymodel_root(self) -> etree.Element:
        """Create CityModel root element per MIT workflow"""
        root = etree.Element(CORE + "CityModel", nsmap=NSMAP)
        
        # Add boundedBy element
        bnd = etree.SubElement(root, GML + "boundedBy")
        null_element = etree.SubElement(bnd, GML + "Null", reason="unknown")
        null_element.text = "unknown"
        
        return root
    
    def add_building(self, citymodel: etree.Element, name: str, gml_id: str) -> etree.Element:
        """Add building to CityModel per MIT semantic mapping"""
        member = etree.SubElement(citymodel, CORE + "cityObjectMember")
        building = etree.SubElement(member, CORE + "Building", attrib={GML + "id": gml_id})
        
        # Add building name
        name_element = etree.SubElement(building, GML + "name")
        name_element.text = name
        
        return building
    
    def extract_building_storeys(self, ifc_model: ifcopenshell.file, building) -> List[Dict]:
        """Extract building storeys following MIT workflow"""
        storeys = []
        
        # Get building storeys through aggregation relationships
        rels = ifc_model.get_inverse(building)
        
        for rel in rels:
            if rel.is_a("IfcRelAggregates"):
                for obj in rel.RelatedObjects:
                    if obj.is_a("IfcBuildingStorey"):
                        storey_info = {
                            "name": obj.Name or f"Storey_{obj.id()}",
                            "elevation": getattr(obj, "Elevation", 0.0),
                            "global_id": obj.GlobalId,
                            "description": obj.Description or ""
                        }
                        storeys.append(storey_info)
        
        return storeys
    
    def add_storey_information(self, building_element: etree.Element, storeys: List[Dict]) -> None:
        """Add storey information to building element per MIT mapping"""
        for storey in storeys:
            # Add storey as gml:name for traceability
            storey_name = etree.SubElement(building_element, GML + "name")
            storey_name.text = f"Storey::{storey['name']}"
            
            # Add storey elevation as generic attribute
            elevation_attr = etree.SubElement(building_element, CORE + "genericAttribute")
            elevation_attr.set("name", "storey_elevation")
            elevation_attr.set("value", str(storey['elevation']))
    
    def extract_building_properties(self, building) -> Dict[str, str]:
        """Extract building properties per MIT workflow"""
        properties = {}
        
        # Extract basic properties
        if hasattr(building, 'Name') and building.Name:
            properties['name'] = building.Name
        if hasattr(building, 'Description') and building.Description:
            properties['description'] = building.Description
        if hasattr(building, 'GlobalId') and building.GlobalId:
            properties['global_id'] = building.GlobalId
        if hasattr(building, 'ObjectType') and building.ObjectType:
            properties['object_type'] = building.ObjectType
        
        # Extract classification information
        classifications = ifc_model.get_inverse(building)
        for rel in classifications:
            if rel.is_a("IfcRelAssociatesClassification"):
                for obj in rel.RelatedObjects:
                    if obj == building:
                        classification = rel.RelatingClassification
                        if classification:
                            properties['classification'] = classification.Name or "Unknown"
        
        return properties
    
    def add_building_properties(self, building_element: etree.Element, properties: Dict[str, str]) -> None:
        """Add building properties as generic attributes"""
        for key, value in properties.items():
            if key != 'name':  # Name is already added separately
                attr = etree.SubElement(building_element, CORE + "genericAttribute")
                attr.set("name", key)
                attr.set("value", str(value))
    
    def write_citygml(self, citymodel: etree.Element, output_path: Path) -> None:
        """Write CityGML file with proper formatting"""
        tree = etree.ElementTree(citymodel)
        tree.write(output_path, pretty_print=True, xml_declaration=True, encoding="utf-8")
    
    def process_ifc_file(self, ifc_path: Path, output_dir: Path) -> ConversionResult:
        """Process single IFC file following MIT workflow"""
        self.buildings_processed = 0
        self.errors = []
        self.warnings = []
        
        try:
            # Open IFC file with IfcOpenShell
            ifc_model = ifcopenshell.open(str(ifc_path))
            logger.info(f"Processing IFC file: {ifc_path}")
            
            # Create CityModel root
            citymodel = self.create_citymodel_root()
            
            # Extract buildings per MIT semantic mapping
            buildings = ifc_model.by_type("IfcBuilding")
            
            if not buildings:
                self.warnings.append("No IfcBuilding entities found in IFC file")
                # Try to find building storeys as fallback
                storeys = ifc_model.by_type("IfcBuildingStorey")
                if storeys:
                    self.warnings.append(f"Found {len(storeys)} building storeys without building entity")
            
            # Process each building
            for idx, building in enumerate(buildings):
                try:
                    # Extract building information
                    building_name = (building.Name or f"Building_{idx}") or f"Building_{idx}"
                    building_id = f"b-{idx}"
                    
                    # Add building to CityModel
                    building_element = self.add_building(citymodel, building_name, building_id)
                    
                    # Extract and add storey information
                    storeys = self.extract_building_storeys(ifc_model, building)
                    if storeys:
                        self.add_storey_information(building_element, storeys)
                    
                    # Extract and add building properties
                    properties = self.extract_building_properties(building)
                    self.add_building_properties(building_element, properties)
                    
                    self.buildings_processed += 1
                    logger.info(f"Processed building: {building_name} with {len(storeys)} storeys")
                    
                except Exception as e:
                    error_msg = f"Error processing building {idx}: {str(e)}"
                    self.errors.append(error_msg)
                    logger.error(error_msg)
            
            # Write CityGML file
            output_file = output_dir / (ifc_path.stem + ".gml")
            self.write_citygml(citymodel, output_file)
            
            logger.info(f"CityGML file written: {output_file}")
            
            return ConversionResult(
                success=len(self.errors) == 0,
                input_file=str(ifc_path),
                output_file=str(output_file),
                buildings_processed=self.buildings_processed,
                errors=self.errors,
                warnings=self.warnings
            )
            
        except Exception as e:
            error_msg = f"Error processing IFC file {ifc_path}: {str(e)}"
            self.errors.append(error_msg)
            logger.error(error_msg)
            
            return ConversionResult(
                success=False,
                input_file=str(ifc_path),
                output_file="",
                buildings_processed=0,
                errors=self.errors,
                warnings=self.warnings
            )

def main():
    """Main conversion function following MIT workflow"""
    if len(sys.argv) < 3:
        print("Usage: ifc_to_citygml.py <input_directory> <output_directory>")
        print("Example: ifc_to_citygml.py models/incoming models/outgoing")
        sys.exit(2)
    
    input_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    
    # Validate input directory
    if not input_dir.exists():
        print(f"Error: Input directory {input_dir} does not exist")
        sys.exit(1)
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize converter
    converter = IFCToCityGMLConverter()
    
    # Process all IFC files
    ifc_files = list(input_dir.glob("*.ifc"))
    if not ifc_files:
        print(f"No IFC files found in {input_dir}")
        sys.exit(1)
    
    print(f"Found {len(ifc_files)} IFC files to process")
    
    successful_conversions = 0
    total_buildings = 0
    
    for ifc_file in ifc_files:
        print(f"\nProcessing: {ifc_file.name}")
        
        result = converter.process_ifc_file(ifc_file, output_dir)
        
        if result.success:
            successful_conversions += 1
            total_buildings += result.buildings_processed
            print(f"✅ Success: {result.buildings_processed} buildings processed")
        else:
            print(f"❌ Failed: {len(result.errors)} errors")
            for error in result.errors:
                print(f"  - {error}")
        
        if result.warnings:
            print(f"⚠️  Warnings: {len(result.warnings)}")
            for warning in result.warnings:
                print(f"  - {warning}")
    
    # Summary
    print(f"\n=== Conversion Summary ===")
    print(f"Files processed: {len(ifc_files)}")
    print(f"Successful conversions: {successful_conversions}")
    print(f"Total buildings processed: {total_buildings}")
    print(f"Output directory: {output_dir}")
    
    if successful_conversions == len(ifc_files):
        print("✅ All conversions completed successfully")
        sys.exit(0)
    else:
        print(f"❌ {len(ifc_files) - successful_conversions} conversions failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
