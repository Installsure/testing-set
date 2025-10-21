from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI(title="Badge UNO", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/healthz")
def healthz():
    return {"status":"ok","service":"Badge UNO"}

@app.get("/readyz")
def readyz():
    return {"ready": True}

@app.get("/metrics")
def metrics():
    return {"latency_p95_ms": 100, "error_rate": 0.0}

@app.post("/v1/parse")
def parse(body: dict = Body(...)):
    return {"uir":{"nodes":["Module","Func"],"effects":["pure"]}}

@app.post("/v1/emit")
def emit(body: dict = Body(...)):
    target = body.get("target","fastapi")
    return {"project_zip_url":"s3://bucket/generated.zip","target":target}

@app.post("/v1/fix")
def fix(body: dict = Body(...)):
    return {"ok": True, "changes": ["formatted","added types"]}

