#!/usr/bin/env python3
"""
Original estimator implementation for translation validation testing.
This represents the "known good" implementation that must be preserved.
"""
def estimate(params):
    """
    Original estimation logic.
    Args:
        params: dict with keys and integer values
    Returns:
        dict with estimation results
    """
    if not params:
        return {"error": "No parameters provided"}
    
    # Simple estimation: sum all values, add 10% overhead
    total = sum(params.values())
    overhead = total * 0.1
    
    return {
        "base_estimate": total,
        "overhead": overhead,
        "total": total + overhead,
        "parameter_count": len(params)
    }
