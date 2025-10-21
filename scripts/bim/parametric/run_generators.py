#!/usr/bin/env python3
"""
Run parametric generators (curriculum obligation).
- Reads parametric "families" described as JSON snippets
- Emits geometry/metadata JSON for downstream validators
This reflects course emphasis on parametric scripting + assemblies.
"""
import json, sys, os
from pathlib import Path
from typing import Dict, Any
from pydantic import BaseModel, Field, ValidationError, confloat

class SlabParams(BaseModel):
    length: confloat(gt=0)
    width: confloat(gt=0)
    thickness: confloat(gt=0)
    material: str = "concrete"

def gen_slab(p: SlabParams) -> Dict[str, Any]:
    # Deterministic "geometry": a param box w/ metadata
    return {
        "type": "Slab",
        "params": p.dict(),
        "bbox": [0,0,0, p.length, p.width, p.thickness],
        "mass_est": p.length * p.width * p.thickness * (2400 if p.material=="concrete" else 1000)
    }

def main():
    out = Path("--out")
    if "--out" in sys.argv:
        out = Path(sys.argv[sys.argv.index("--out")+1])
    else:
        out = Path("models/generated")
    out.mkdir(parents=True, exist_ok=True)

    # Example input (would be your scripted families)
    samples = [
        {"length": 6.0, "width": 3.0, "thickness": 0.25, "material":"concrete"},
        {"length": 12.0, "width": 6.0, "thickness": 0.30, "material":"concrete"}
    ]
    out_file = out / "slabs.jsonl"
    with out_file.open("w", encoding="utf-8") as f:
        for s in samples:
            try:
                obj = gen_slab(SlabParams(**s))
                f.write(json.dumps(obj)+"\n")
            except ValidationError as e:
                print("[PARAMETRIC FAIL]", e)
                sys.exit(1)
    print(f"[GENERATED] {out_file}")

if __name__ == "__main__":
    main()
