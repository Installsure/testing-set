"""
Test suite for InstallSure JarvisOps FastAPI application
Comprehensive testing for all endpoints and functionality
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_healthz_endpoint(self):
        """Test /healthz endpoint"""
        response = client.get("/healthz")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "JarvisOps"
    
    def test_readyz_endpoint(self):
        """Test /readyz endpoint"""
        response = client.get("/readyz")
        assert response.status_code == 200
        data = response.json()
        assert data["ready"] is True
    
    def test_metrics_endpoint(self):
        """Test /metrics endpoint"""
        response = client.get("/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "latency_p95_ms" in data
        assert "error_rate" in data
        assert data["error_rate"] == 0.0

class TestPlanEndpoints:
    """Test planning functionality"""
    
    def test_plan_endpoint(self):
        """Test /v1/plan endpoint"""
        response = client.post("/v1/plan", json={"description": "Test plan"})
        assert response.status_code == 200
        data = response.json()
        assert "plan_id" in data
        assert "steps" in data
        assert "requires_approval" in data
        assert data["steps"] == ["ingest", "curate", "build", "eval"]
        assert data["requires_approval"] is False

class TestJobEndpoints:
    """Test job management"""
    
    def test_run_endpoint(self):
        """Test /v1/run endpoint"""
        response = client.post("/v1/run", json={"plan_id": "test-plan"})
        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
    
    def test_job_status_endpoint(self):
        """Test /v1/jobs/{job_id} endpoint"""
        # First create a job
        run_response = client.post("/v1/run", json={"plan_id": "test-plan"})
        job_id = run_response.json()["job_id"]
        
        # Then check its status
        response = client.get(f"/v1/jobs/{job_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "COMPLETED"
    
    def test_unknown_job_status(self):
        """Test job status for non-existent job"""
        response = client.get("/v1/jobs/non-existent-id")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "UNKNOWN"

class TestMemoryEndpoints:
    """Test memory management functionality"""
    
    def test_memory_append_endpoint(self):
        """Test /v1/memory/append endpoint"""
        test_data = {
            "scope": "test_append",
            "entries": ["entry1", "entry2"]
        }
        response = client.post("/v1/memory/append", json=test_data)
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
    
    def test_memory_get_endpoint(self):
        """Test /v1/memory/get endpoint"""
        # Use unique scope to avoid conflicts
        unique_scope = f"test_get_{id(self)}"
        
        # First add some data
        client.post("/v1/memory/append", json={
            "scope": unique_scope,
            "entries": ["entry1", "entry2"]
        })
        
        # Then retrieve it
        response = client.get(f"/v1/memory/get?scope={unique_scope}")
        assert response.status_code == 200
        data = response.json()
        assert "entries" in data
        assert len(data["entries"]) == 2
    
    def test_memory_get_default_scope(self):
        """Test /v1/memory/get endpoint with default scope"""
        response = client.get("/v1/memory/get")
        assert response.status_code == 200
        data = response.json()
        assert "entries" in data

class TestSecurityFeatures:
    """Test security-related functionality"""
    
    def test_cors_headers(self):
        """Test CORS middleware is working"""
        response = client.options("/healthz")
        # Should not fail due to CORS
    
    def test_input_validation(self):
        """Test input validation on endpoints"""
        # Test with invalid JSON
        response = client.post("/v1/plan", json="invalid")
        assert response.status_code == 422  # Validation error

class TestPerformanceFeatures:
    """Test performance and scalability"""
    
    def test_concurrent_requests(self):
        """Test handling multiple concurrent requests"""
        import threading
        import time
        
        results = []
        
        def make_request():
            response = client.get("/healthz")
            results.append(response.status_code)
        
        threads = []
        for i in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        assert len(results) == 10
        assert all(status == 200 for status in results)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
