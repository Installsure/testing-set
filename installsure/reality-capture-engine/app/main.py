from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI(title="Reality Capture Engine", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/healthz")
def healthz():
    return {"status":"ok","service":"Reality Capture Engine"}

@app.get("/readyz")
def readyz():
    return {"ready": True}

@app.get("/metrics")
def metrics():
    return {"latency_p95_ms": 100, "error_rate": 0.0}

@app.post("/v1/capture-plans")
def capture_plans(body: dict = Body(...)):
    return {"plan_id": str(uuid.uuid4())}

@app.post("/v1/ingest/tripod")
def ingest_tripod(body: dict = Body(...)):
    return {"job_id": str(uuid.uuid4()), "status":"QUEUED"}

@app.post("/v1/ingest/drone")
def ingest_drone(body: dict = Body(...)):
    return {"job_id": str(uuid.uuid4()), "status":"QUEUED"}

@app.post("/v1/process/photogrammetry")
def photogrammetry(body: dict = Body(...)):
    return {"job_id": str(uuid.uuid4())}

@app.post("/v1/process/register")
def register(body: dict = Body(...)):
    return {"job_id": str(uuid.uuid4())}

@app.post("/v1/export/tiles")
def export_tiles(body: dict = Body(...)):
    return {"tileset_url":"s3://bucket/tiles/tileset.json"}

@app.get("/v1/jobs/{job_id}")
def jobs(job_id: str):
    return {"state":"COMPLETED","progress":100}

