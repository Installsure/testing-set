from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI(title="AtlasSearch", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/healthz")
def healthz():
    return {"status":"ok","service":"AtlasSearch"}

@app.get("/readyz")
def readyz():
    return {"ready": True}

@app.get("/metrics")
def metrics():
    return {"latency_p95_ms": 100, "error_rate": 0.0}

RESEARCH = {}

@app.post("/v1/research/start")
def research_start(body: dict = Body(...)):
    rid = str(uuid.uuid4())
    RESEARCH[rid] = {"status":"COMPLETED","brief":"# Executive Brief\n- Example [1]","citations":[{"id":1,"url":"https://example.com"}]}
    return {"id": rid}

@app.get("/v1/research/{rid}/status")
def research_status(rid: str):
    return RESEARCH.get(rid, {"status":"UNKNOWN"})

@app.get("/v1/research/{rid}/brief")
def research_brief(rid: str):
    data = RESEARCH.get(rid)
    if not data: raise HTTPException(404)
    return data

