from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI(title="SentinelGuard", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/healthz")
def healthz():
    return {"status":"ok","service":"SentinelGuard"}

@app.get("/readyz")
def readyz():
    return {"ready": True}

@app.get("/metrics")
def metrics():
    return {"latency_p95_ms": 100, "error_rate": 0.0}

@app.post("/v1/scan/system")
def scan_system():
    return {"id": str(uuid.uuid4()), "findings":[]}

@app.post("/v1/scan/repo")
def scan_repo(body: dict = Body(...)):
    return {"id": str(uuid.uuid4()), "findings":[{"type":"secret","path":"README.md","line":1}]}

@app.get("/v1/reports/{rid}")
def report(rid: str):
    return {"id": rid, "summary":"No critical issues"}

@app.post("/v1/enforce/quarantine")
def quarantine(body: dict = Body(...)):
    return {"status":"QUARANTINED","artifact_id": body.get("artifact_id")}

