#!/usr/bin/env python3
"""
Validate parametric outputs against curriculum rules.
- Reads docs/bim/parametric_rules.md for required fields (simple parser)
- Validates generated JSONL artifacts for parameter bounds & required metadata
Exit nonzero on any violation.
"""
import re, sys, json
from pathlib import Path

REQUIRED_FIELDS = ["Parameters", "Constraints", "Assembly rules", "Generation scripts", "Post-gen validation", "Export/roundtrip"]

def doc_has_sections(md_path: Path) -> bool:
    text = md_path.read_text(encoding="utf-8")
    missing = [sec for sec in REQUIRED_FIELDS if re.search(rf"^\\s*[-*]\\s*{re.escape(sec)}", text, re.IGNORECASE|re.MULTILINE) is None]
    if missing:
        print("[FAIL] Missing sections in parametric_rules.md:", ", ".join(missing))
        return False
    return True

def validate_generated(dir_path: Path) -> int:
    failures = 0
    for jf in dir_path.glob("*.jsonl"):
        for line in jf.read_text(encoding="utf-8").splitlines():
            try:
                obj = json.loads(line)
                if obj.get("type") == "Slab":
                    p = obj.get("params", {})
                    for k in ("length","width","thickness"):
                        if p.get(k) is None or p[k] <= 0:
                            print(f"[FAIL] {jf.name}: invalid {k}={p.get(k)}")
                            failures += 1
            except Exception as e:
                print(f"[FAIL] {jf.name}: {e}"); failures += 1
    if failures==0:
        print("[OK] Parametric outputs validated.")
    return failures

def main():
    if len(sys.argv) < 3:
        print("Usage: validate_rules.py <generated_dir> <rules_md>"); sys.exit(2)
    gen, rules = Path(sys.argv[1]), Path(sys.argv[2])
    ok = doc_has_sections(rules)
    failures = validate_generated(gen)
    sys.exit(0 if ok and failures==0 else 1)

if __name__ == "__main__":
    main()
