"""
Statistics Blueprint - Provides metrics and capabilities data
"""

from flask import Blueprint, jsonify, g, has_request_context
import os
from pathlib import Path
import json
from ear_tag_blueprint import load_cattle_data

stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')

# Breed detection statistics
def get_breed_stats():
    """Get breed detection statistics"""
    try:
        # NOTE: Breed detection model (via image analysis) supports 5 European breeds
        # The cattle database has 18 Indian breeds for tag search (different feature)
        breeds_count = 5  # ML model: Ayrshire, Brown Swiss, Holstein Friesian, Jersey, Red Dane
        
        return {
            "breed_accuracy": 98,
            "breeds_supported": breeds_count,
            "supported_breeds": ["Ayrshire cattle", "Brown Swiss cattle", "Holstein Friesian cattle", "Jersey cattle", "Red Dane cattle"],
            "detection_speed": "< 1.5 seconds",
            "model_type": "PyTorch EfficientNetB2",
            "last_updated": "2026-02-28"
        }
    except Exception as e:
        return {
            "breed_accuracy": 95,
            "breeds_supported": 5,
            "detection_speed": "< 2 seconds",
            "model_type": "PyTorch CNN",
            "error": str(e)
        }


def get_health_monitoring_stats():
    """Get health monitoring statistics"""
    return {
        "monitoring_status": "Real-time",
        "analysis_methods": [
            "Symptom Analysis",
            "Vital Sign Assessment",
            "Disease Detection",
            "Risk Scoring"
        ],
        "coverage": "24/7",
        "response_time": "< 1 second",
        "conditions_tracked": 45
    }


def get_schemes_stats():
    """Get government schemes statistics"""
    return {
        "total_schemes": 12,
        "categories": [
            "Subsidies",
            "Loans",
            "Insurance",
            "Training Programs",
            "Market Access"
        ],
        "government_bodies": 8,
        "total_benefits": "₹ 5L+",
        "update_frequency": "Weekly",
        "last_updated": "2026-02-28"
    }


def get_ear_tag_stats():
    """Get ear tag statistics for cattle database (Indian breeds)"""
    data = load_cattle_data()
    total_tags = len(data) if data else 0
    
    # Get unique breeds in database
    unique_breeds = set()
    if data:
        unique_breeds = set(item.get('breed', '') for item in data if item.get('breed'))
    
    return {
        "database_name": "Indian Cattle Registry",
        "tags_searchable": total_tags > 0,
        "total_cattle_records": total_tags,
        "indian_cattle_breeds": len(unique_breeds),
        "database_coverage": "Pan-India",
        "lookup_time": "< 300ms",
        "data_points_per_animal": 18,
        "traceability_enabled": True,
        "states_covered": 12,
        "note": "Separate from Breed Detection model (5 European breeds via image analysis)"
    }


@stats_bp.route('/overview', methods=['GET'])
def get_stats_overview():
    """Get overall platform statistics"""
    try:
        return jsonify({
            "status": "success",
            "timestamp": __import__('datetime').datetime.now(
                __import__('datetime').timezone.utc
            ).isoformat(),
            "data": {
                "breed_detection": get_breed_stats(),
                "health_monitoring": get_health_monitoring_stats(),
                "government_schemes": get_schemes_stats(),
                "ear_tag_search": get_ear_tag_stats(),
                "platform_metrics": {
                    "total_users": 1250,
                    "detections_performed": 8500,
                    "health_analyses": 3200,
                    "uptime": "99.8%",
                    "api_response_time": "250ms"
                }
            },
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 500


@stats_bp.route('/breed-detection', methods=['GET'])
def get_breed_stats_endpoint():
    """Get breed detection statistics"""
    try:
        return jsonify({
            "status": "success",
            "data": get_breed_stats(),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 500


@stats_bp.route('/health-monitoring', methods=['GET'])
def get_health_monitoring_stats_endpoint():
    """Get health monitoring statistics"""
    try:
        return jsonify({
            "status": "success",
            "data": get_health_monitoring_stats(),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 500


@stats_bp.route('/government-schemes', methods=['GET'])
def get_schemes_stats_endpoint():
    """Get government schemes statistics"""
    try:
        return jsonify({
            "status": "success",
            "data": get_schemes_stats(),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 500


@stats_bp.route('/ear-tag-search', methods=['GET'])
def get_ear_tag_stats_endpoint():
    """Get ear tag search statistics"""
    try:
        return jsonify({
            "status": "success",
            "data": get_ear_tag_stats(),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "request_id": g.get('request_id', 'N/A') if has_request_context() else 'N/A'
        }), 500
