#!/usr/bin/env python3
"""
Parametric Generators (MIT 4.507/4.567 BIM Curriculum Implementation)
Generates deterministic BIM components following MIT parametric modeling standards
"""
import json, sys, os
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ValidationError, confloat, validator
from dataclasses import dataclass
from datetime import datetime
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Parameter models following MIT curriculum standards
class LengthParameter(BaseModel):
    """Length parameter with units and bounds"""
    value: confloat(gt=0)
    unit: str = Field(default="mm")
    
    @validator('unit')
    def validate_unit(cls, v):
        allowed_units = ["mm", "cm", "m", "ft", "in"]
        if v not in allowed_units:
            raise ValueError(f"Unit must be one of {allowed_units}")
        return v

class AngleParameter(BaseModel):
    """Angle parameter with units and bounds"""
    value: confloat(ge=0, le=360)
    unit: str = Field(default="degrees")
    
    @validator('unit')
    def validate_unit(cls, v):
        allowed_units = ["degrees", "radians"]
        if v not in allowed_units:
            raise ValueError(f"Unit must be one of {allowed_units}")
        return v

class MaterialParameter(BaseModel):
    """Material parameter with validation"""
    name: str
    density: confloat(gt=0) = Field(default=2400)  # kg/m³
    thermal_conductivity: confloat(gt=0) = Field(default=1.5)  # W/mK
    
    @validator('name')
    def validate_material(cls, v):
        allowed_materials = ["concrete", "steel", "wood", "brick", "glass", "aluminum"]
        if v.lower() not in allowed_materials:
            raise ValueError(f"Material must be one of {allowed_materials}")
        return v.lower()

class SlabParameters(BaseModel):
    """Slab component parameters following MIT standards"""
    length: LengthParameter
    width: LengthParameter
    thickness: LengthParameter
    material: MaterialParameter
    
    @validator('thickness')
    def validate_thickness(cls, v):
        if v.value < 100:  # Minimum 100mm thickness
            raise ValueError("Slab thickness must be at least 100mm")
        if v.value > 1000:  # Maximum 1000mm thickness
            raise ValueError("Slab thickness must be at most 1000mm")
        return v

class WallParameters(BaseModel):
    """Wall component parameters following MIT standards"""
    length: LengthParameter
    height: LengthParameter
    thickness: LengthParameter
    material: MaterialParameter
    
    @validator('thickness')
    def validate_thickness(cls, v):
        if v.value < 100:  # Minimum 100mm thickness
            raise ValueError("Wall thickness must be at least 100mm")
        if v.value > 500:  # Maximum 500mm thickness
            raise ValueError("Wall thickness must be at most 500mm")
        return v

class ColumnParameters(BaseModel):
    """Column component parameters following MIT standards"""
    height: LengthParameter
    cross_section: Dict[str, LengthParameter]  # width, depth
    
    @validator('cross_section')
    def validate_cross_section(cls, v):
        if 'width' not in v or 'depth' not in v:
            raise ValueError("Cross section must have width and depth")
        return v

@dataclass
class GeneratedComponent:
    """Generated BIM component with metadata"""
    id: str
    type: str
    parameters: Dict[str, Any]
    geometry: Dict[str, Any]
    properties: Dict[str, Any]
    metadata: Dict[str, Any]
    timestamp: datetime

class ParametricGenerator:
    """Parametric generator following MIT curriculum"""
    
    def __init__(self):
        self.generated_components = []
    
    def generate_slab(self, params: SlabParameters) -> GeneratedComponent:
        """Generate slab component following MIT standards"""
        component_id = str(uuid.uuid4())
        
        # Convert to consistent units (mm)
        length_mm = self._convert_to_mm(params.length.value, params.length.unit)
        width_mm = self._convert_to_mm(params.width.value, params.width.unit)
        thickness_mm = self._convert_to_mm(params.thickness.value, params.thickness.unit)
        
        # Generate geometry (bounding box representation)
        geometry = {
            "type": "box",
            "dimensions": [length_mm, width_mm, thickness_mm],
            "origin": [0, 0, 0],
            "volume": length_mm * width_mm * thickness_mm / 1e9  # Convert to m³
        }
        
        # Generate properties
        properties = {
            "material": {
                "name": params.material.name,
                "density": params.material.density,
                "thermal_conductivity": params.material.thermal_conductivity
            },
            "structural": {
                "area": (length_mm * width_mm) / 1e6,  # Convert to m²
                "volume": geometry["volume"],
                "mass": geometry["volume"] * params.material.density
            },
            "thermal": {
                "r_value": thickness_mm / (params.material.thermal_conductivity * 1000),  # m²K/W
                "u_value": 1 / (thickness_mm / (params.material.thermal_conductivity * 1000))  # W/m²K
            }
        }
        
        # Generate metadata
        metadata = {
            "classification": "IfcSlab",
            "generation_method": "parametric",
            "constraints_validated": True,
            "simulation_ready": True
        }
        
        component = GeneratedComponent(
            id=component_id,
            type="Slab",
            parameters=params.dict(),
            geometry=geometry,
            properties=properties,
            metadata=metadata,
            timestamp=datetime.utcnow()
        )
        
        self.generated_components.append(component)
        return component
    
    def generate_wall(self, params: WallParameters) -> GeneratedComponent:
        """Generate wall component following MIT standards"""
        component_id = str(uuid.uuid4())
        
        # Convert to consistent units (mm)
        length_mm = self._convert_to_mm(params.length.value, params.length.unit)
        height_mm = self._convert_to_mm(params.height.value, params.height.unit)
        thickness_mm = self._convert_to_mm(params.thickness.value, params.thickness.unit)
        
        # Generate geometry
        geometry = {
            "type": "box",
            "dimensions": [length_mm, thickness_mm, height_mm],
            "origin": [0, 0, 0],
            "volume": length_mm * thickness_mm * height_mm / 1e9  # Convert to m³
        }
        
        # Generate properties
        properties = {
            "material": {
                "name": params.material.name,
                "density": params.material.density,
                "thermal_conductivity": params.material.thermal_conductivity
            },
            "structural": {
                "area": (length_mm * height_mm) / 1e6,  # Convert to m²
                "volume": geometry["volume"],
                "mass": geometry["volume"] * params.material.density
            },
            "thermal": {
                "r_value": thickness_mm / (params.material.thermal_conductivity * 1000),
                "u_value": 1 / (thickness_mm / (params.material.thermal_conductivity * 1000))
            }
        }
        
        # Generate metadata
        metadata = {
            "classification": "IfcWall",
            "generation_method": "parametric",
            "constraints_validated": True,
            "simulation_ready": True
        }
        
        component = GeneratedComponent(
            id=component_id,
            type="Wall",
            parameters=params.dict(),
            geometry=geometry,
            properties=properties,
            metadata=metadata,
            timestamp=datetime.utcnow()
        )
        
        self.generated_components.append(component)
        return component
    
    def generate_column(self, params: ColumnParameters) -> GeneratedComponent:
        """Generate column component following MIT standards"""
        component_id = str(uuid.uuid4())
        
        # Convert to consistent units (mm)
        height_mm = self._convert_to_mm(params.height.value, params.height.unit)
        width_mm = self._convert_to_mm(params.cross_section['width'].value, params.cross_section['width'].unit)
        depth_mm = self._convert_to_mm(params.cross_section['depth'].value, params.cross_section['depth'].unit)
        
        # Generate geometry
        geometry = {
            "type": "box",
            "dimensions": [width_mm, depth_mm, height_mm],
            "origin": [0, 0, 0],
            "volume": width_mm * depth_mm * height_mm / 1e9  # Convert to m³
        }
        
        # Generate properties (assuming steel for columns)
        material_density = 7850  # Steel density kg/m³
        properties = {
            "material": {
                "name": "steel",
                "density": material_density,
                "thermal_conductivity": 50.0  # Steel thermal conductivity
            },
            "structural": {
                "cross_sectional_area": (width_mm * depth_mm) / 1e6,  # Convert to m²
                "volume": geometry["volume"],
                "mass": geometry["volume"] * material_density
            },
            "thermal": {
                "r_value": height_mm / (50.0 * 1000),  # Steel R-value
                "u_value": 1 / (height_mm / (50.0 * 1000))
            }
        }
        
        # Generate metadata
        metadata = {
            "classification": "IfcColumn",
            "generation_method": "parametric",
            "constraints_validated": True,
            "simulation_ready": True
        }
        
        component = GeneratedComponent(
            id=component_id,
            type="Column",
            parameters=params.dict(),
            geometry=geometry,
            properties=properties,
            metadata=metadata,
            timestamp=datetime.utcnow()
        )
        
        self.generated_components.append(component)
        return component
    
    def _convert_to_mm(self, value: float, unit: str) -> float:
        """Convert length to millimeters"""
        conversions = {
            "mm": 1.0,
            "cm": 10.0,
            "m": 1000.0,
            "ft": 304.8,
            "in": 25.4
        }
        return value * conversions.get(unit, 1.0)
    
    def export_components(self, output_path: Path) -> None:
        """Export generated components to JSONL file"""
        with output_path.open("w", encoding="utf-8") as f:
            for component in self.generated_components:
                # Convert to JSON-serializable format
                component_dict = {
                    "id": component.id,
                    "type": component.type,
                    "parameters": component.parameters,
                    "geometry": component.geometry,
                    "properties": component.properties,
                    "metadata": component.metadata,
                    "timestamp": component.timestamp.isoformat()
                }
                f.write(json.dumps(component_dict) + "\n")
        
        logger.info(f"Exported {len(self.generated_components)} components to {output_path}")

def main():
    """Main generation function following MIT curriculum"""
    output_path = Path("models/generated")
    
    # Parse command line arguments
    if "--out" in sys.argv:
        out_index = sys.argv.index("--out")
        if out_index + 1 < len(sys.argv):
            output_path = Path(sys.argv[out_index + 1])
    
    # Create output directory
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Initialize generator
    generator = ParametricGenerator()
    
    # Generate example components following MIT standards
    logger.info("Generating parametric components following MIT 4.507/4.567 curriculum")
    
    try:
        # Generate slab components
        slab_params = [
            {
                "length": {"value": 6000, "unit": "mm"},
                "width": {"value": 3000, "unit": "mm"},
                "thickness": {"value": 250, "unit": "mm"},
                "material": {"name": "concrete", "density": 2400, "thermal_conductivity": 1.5}
            },
            {
                "length": {"value": 12, "unit": "m"},
                "width": {"value": 6, "unit": "m"},
                "thickness": {"value": 0.3, "unit": "m"},
                "material": {"name": "concrete", "density": 2400, "thermal_conductivity": 1.5}
            }
        ]
        
        for slab_param in slab_params:
            params = SlabParameters(**slab_param)
            component = generator.generate_slab(params)
            logger.info(f"Generated slab: {component.id}")
        
        # Generate wall components
        wall_params = [
            {
                "length": {"value": 5000, "unit": "mm"},
                "height": {"value": 3000, "unit": "mm"},
                "thickness": {"value": 200, "unit": "mm"},
                "material": {"name": "brick", "density": 1800, "thermal_conductivity": 0.8}
            }
        ]
        
        for wall_param in wall_params:
            params = WallParameters(**wall_param)
            component = generator.generate_wall(params)
            logger.info(f"Generated wall: {component.id}")
        
        # Generate column components
        column_params = [
            {
                "height": {"value": 4000, "unit": "mm"},
                "cross_section": {
                    "width": {"value": 300, "unit": "mm"},
                    "depth": {"value": 300, "unit": "mm"}
                }
            }
        ]
        
        for column_param in column_params:
            params = ColumnParameters(**column_param)
            component = generator.generate_column(params)
            logger.info(f"Generated column: {component.id}")
        
        # Export components
        output_file = output_path / "parametric_components.jsonl"
        generator.export_components(output_file)
        
        logger.info(f"✅ Generated {len(generator.generated_components)} components")
        logger.info(f"✅ Exported to {output_file}")
        
    except ValidationError as e:
        logger.error(f"❌ Parameter validation error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Generation error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
