from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI(title="JarvisOps", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/healthz")
def healthz():
    return {"status":"ok","service":"JarvisOps"}

@app.get("/readyz")
def readyz():
    return {"ready": True}

@app.get("/metrics")
def metrics():
    return {"latency_p95_ms": 100, "error_rate": 0.0}

JOBS = {}
MEMORY = {}

@app.post("/v1/plan")
def plan(body: dict = Body(...)):
    pid = str(uuid.uuid4())
    JOBS[pid] = {"status":"PLANNED"}
    return {"plan_id": pid, "steps": ["ingest","curate","build","eval"], "requires_approval": False}

@app.post("/v1/run")
def run(body: dict = Body(...)):
    jid = str(uuid.uuid4())
    JOBS[jid] = {"status":"COMPLETED"}
    return {"job_id": jid}

@app.get("/v1/jobs/{job_id}")
def job(job_id: str):
    return JOBS.get(job_id, {"status":"UNKNOWN"})

@app.post("/v1/memory/append")
def mem_append(body: dict = Body(...)):
    scope = body.get("scope","global")
    MEMORY.setdefault(scope, []).extend(body.get("entries",[]))
    return {"ok": True}

@app.get("/v1/memory/get")
def mem_get(scope: str = "global"):
    return {"entries": MEMORY.get(scope, [])}

