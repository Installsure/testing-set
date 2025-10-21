# Parametric Rules & Shape Grammars (MIT BIM Curriculum; Harvard GSD Comp Modeling)

## Overview

Based on MIT 4.507/4.567 BIM curriculum and Harvard GSD computational modeling pedagogy.

This document defines the parametric modeling framework for BIM component generation, assembly, and validation.

## For Each Family/Component

### Parameters

**Explicit names, types, bounds (units!)**

#### Standard Parameter Types

- **Length**: Real numbers with units (mm, m, ft)
- **Angle**: Real numbers with units (degrees, radians)
- **Count**: Positive integers
- **Material**: Enumerated material types
- **Boolean**: True/false flags

#### Parameter Bounds

- **Minimum Values**: Enforced for all parameters
- **Maximum Values**: Enforced for all parameters
- **Step Values**: Increment constraints for continuous parameters
- **Default Values**: Required for all parameters

#### Example: Wall Component

```json
{
  "length": {
    "type": "length",
    "min": 100,
    "max": 10000,
    "unit": "mm",
    "default": 3000
  },
  "height": {
    "type": "length",
    "min": 2000,
    "max": 4000,
    "unit": "mm",
    "default": 3000
  },
  "thickness": {
    "type": "length",
    "min": 100,
    "max": 500,
    "unit": "mm",
    "default": 200
  },
  "material": {
    "type": "enum",
    "options": ["concrete", "brick", "steel"],
    "default": "concrete"
  },
  "has_opening": { "type": "boolean", "default": false }
}
```

### Constraints

**Geometric + semantic (connectivity, tolerances)**

#### Geometric Constraints

- **Dimensional Constraints**: Length, width, height relationships
- **Angle Constraints**: Slope, alignment, orientation limits
- **Shape Constraints**: Aspect ratios, proportions
- **Volume Constraints**: Minimum/maximum volume limits

#### Semantic Constraints

- **Connectivity Rules**: How components connect to each other
- **Tolerance Specifications**: Manufacturing and installation tolerances
- **Performance Requirements**: Structural, thermal, acoustic properties
- **Code Compliance**: Building code and regulation requirements

#### Example: Wall Constraints

```json
{
  "geometric": {
    "aspect_ratio": { "min": 0.1, "max": 10.0 },
    "volume_min": { "value": 0.1, "unit": "m3" },
    "volume_max": { "value": 50.0, "unit": "m3" }
  },
  "semantic": {
    "connection_types": ["wall-to-wall", "wall-to-slab", "wall-to-beam"],
    "tolerance": { "value": 5, "unit": "mm" },
    "fire_rating": { "min": 30, "unit": "minutes" }
  }
}
```

### Assembly Rules

**How components compose; legal adjacency/attachment**

#### Adjacency Rules

- **Allowed Connections**: Which components can connect
- **Connection Types**: Mechanical, structural, service connections
- **Connection Geometry**: Point, line, surface connections
- **Connection Constraints**: Orientation, alignment, spacing

#### Assembly Patterns

- **Grid-Based Assembly**: Regular spacing and alignment
- **Free-Form Assembly**: Flexible positioning with constraints
- **Hierarchical Assembly**: Parent-child relationships
- **Constraint-Based Assembly**: Rule-driven positioning

#### Example: Wall Assembly Rules

```json
{
  "adjacency": {
    "allowed_connections": ["wall", "slab", "column", "beam"],
    "connection_types": ["butt", "miter", "lap"],
    "min_spacing": { "value": 100, "unit": "mm" },
    "max_spacing": { "value": 6000, "unit": "mm" }
  },
  "patterns": {
    "grid_alignment": { "enabled": true, "spacing": 600 },
    "hierarchical": { "parent": "building", "children": ["floor", "room"] }
  }
}
```

### Generation Scripts

**Deterministic steps to produce geometry + metadata**

#### Script Structure

- **Input Validation**: Parameter bounds checking
- **Geometry Generation**: 3D model creation
- **Property Assignment**: Material and performance properties
- **Metadata Generation**: Classification and identification
- **Quality Validation**: Geometry and property verification

#### Script Execution

- **Deterministic**: Same inputs always produce same outputs
- **Idempotent**: Multiple executions produce identical results
- **Validated**: All outputs are validated against constraints
- **Logged**: All operations are logged for debugging

#### Example: Wall Generation Script

```python
def generate_wall(params):
    # Input validation
    validate_parameters(params)

    # Geometry generation
    geometry = create_wall_geometry(
        length=params['length'],
        height=params['height'],
        thickness=params['thickness']
    )

    # Property assignment
    properties = assign_material_properties(
        material=params['material'],
        geometry=geometry
    )

    # Metadata generation
    metadata = generate_wall_metadata(
        classification="IfcWall",
        properties=properties
    )

    # Quality validation
    validate_wall_output(geometry, properties, metadata)

    return {
        "geometry": geometry,
        "properties": properties,
        "metadata": metadata
    }
```

### Post-Gen Validation

**Rule checks + simulation hooks (energy/egress/etc.)**

#### Rule Checks

- **Geometric Validation**: Topology, connectivity, dimensions
- **Property Validation**: Material properties, performance values
- **Code Compliance**: Building code and regulation compliance
- **Quality Assurance**: Manufacturing and installation feasibility

#### Simulation Hooks

- **Energy Analysis**: Thermal performance simulation
- **Structural Analysis**: Load-bearing capacity simulation
- **Acoustic Analysis**: Sound transmission simulation
- **Fire Analysis**: Fire resistance simulation
- **Egress Analysis**: Emergency evacuation simulation

#### Example: Wall Validation

```json
{
  "rule_checks": {
    "geometry": ["topology_valid", "dimensions_within_bounds"],
    "properties": ["material_consistent", "performance_adequate"],
    "compliance": ["building_code", "fire_rating", "accessibility"]
  },
  "simulations": {
    "energy": "thermal_analysis",
    "structural": "load_analysis",
    "acoustic": "sound_transmission",
    "fire": "fire_resistance"
  }
}
```

### Export/Roundtrip

**IFC class mapping + CityGML feature mapping**

#### IFC Class Mapping

- **IfcWall**: Wall components
- **IfcSlab**: Floor and roof components
- **IfcColumn**: Vertical structural elements
- **IfcBeam**: Horizontal structural elements
- **IfcDoor/IfcWindow**: Opening components

#### CityGML Feature Mapping

- **Building**: Complete building representations
- **BuildingPart**: Building subdivisions
- **WallSurface**: Wall geometry and properties
- **RoofSurface**: Roof geometry and properties
- **GroundSurface**: Ground and floor surfaces

#### Export Validation

- **IFC Compliance**: IFC 4.3 specification compliance
- **CityGML Compliance**: CityGML 3.0 specification compliance
- **Roundtrip Validation**: IFC → CityGML → IFC equivalence
- **Semantic Preservation**: Property and relationship preservation

#### Example: Export Mapping

```json
{
  "ifc_mapping": {
    "wall_component": "IfcWall",
    "properties": {
      "material": "IfcMaterial",
      "dimensions": "IfcQuantityLength",
      "performance": "IfcPropertySet"
    }
  },
  "citygml_mapping": {
    "wall_component": "WallSurface",
    "properties": {
      "material": "material",
      "dimensions": "lod2Solid",
      "performance": "genericAttribute"
    }
  }
}
```

## Implementation Requirements

### Technology Stack

- **Parametric Engine**: Grasshopper/Rhino or custom Python
- **Geometry Library**: OpenCASCADE or CGAL
- **IFC Library**: IfcOpenShell
- **CityGML Library**: Custom Python with lxml
- **Validation Framework**: Custom rule engine

### Performance Requirements

- **Generation Time**: < 1 second per component
- **Validation Time**: < 0.5 seconds per component
- **Export Time**: < 2 seconds per component
- **Memory Usage**: < 100MB per component

### Quality Requirements

- **Geometric Accuracy**: ±1mm tolerance
- **Property Accuracy**: 100% property preservation
- **Export Fidelity**: 100% semantic preservation
- **Validation Coverage**: 100% rule coverage
