from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI(title="3D Builder Engine", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/healthz")
def healthz():
    return {"status":"ok","service":"3D Builder Engine"}

@app.get("/readyz")
def readyz():
    return {"ready": True}

@app.get("/metrics")
def metrics():
    return {"latency_p95_ms": 100, "error_rate": 0.0}

@app.post("/v1/projects")
def create_project(body: dict = Body(...)):
    return {"id": str(uuid.uuid4()), "name": body.get("name","Untitled")}

@app.post("/v1/import/blueprints")
def import_blueprints(body: dict = Body(...)):
    return {"job_id": str(uuid.uuid4()), "status": "ACCEPTED"}

@app.post("/v1/build/model")
def build_model(body: dict = Body(...)):
    return {"job_id": str(uuid.uuid4()), "status": "QUEUED"}

@app.get("/v1/projects/{pid}/artifacts")
def artifacts(pid: str):
    return {"ifc_url":"s3://bucket/ifc.ifc","glb_url":"s3://bucket/model.glb","tileset_url":"s3://bucket/tiles/tileset.json","report_url":"s3://bucket/report.pdf"}

@app.get("/v1/viewer/token")
def viewer_token(project_id: str):
    return {"tileset_url":"s3://bucket/tiles/tileset.json","jwt":"demo.jwt"}

